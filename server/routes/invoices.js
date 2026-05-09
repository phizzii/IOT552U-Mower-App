const express = require('express');
const router = express.Router();
const db = require('../db/db');
const {
  all,
  asyncHandler,
  getOne,
  normalizeText,
  parseDate,
  parseInteger,
  parseNumber,
  run,
  sendValidationErrors,
  validateIdParam,
  withTransaction,
} = require('../utils/routeHelpers');

function getInvoicePayload(body) {
  const errors = [];
  const customer_id = parseInteger(body.customer_id, 'customer_id', errors, {
    min: 1,
    required: true,
  });
  const job_no = parseInteger(body.job_no, 'job_no', errors, { min: 1 });
  const sale_item_no = parseInteger(body.sale_item_no, 'sale_item_no', errors, {
    min: 1,
  });
  const sale_items = parseSaleItems(body.sale_items, errors, sale_item_no);

  if (job_no === null && sale_items.length === 0) {
    errors.push('At least one of job_no or sale_items is required');
  }

  return {
    customer_id,
    date_paid: parseDate(body.date_paid, 'date_paid', errors),
    errors,
    job_no,
    payment_type: normalizeText(body.payment_type),
    sale_item_no: sale_items[0]?.sale_item_no || sale_item_no,
    sale_items,
    total_cost: parseNumber(body.total_cost, 'total_cost', errors, {
      min: 0,
      required: true,
    }),
  };
}

function parseSaleItems(value, errors, fallbackSaleItemNo = null) {
  if (Array.isArray(value)) {
    const mergedItems = new Map();

    value.forEach((item, index) => {
      const saleItemNo = parseInteger(
        item?.sale_item_no,
        `sale_items[${index}].sale_item_no`,
        errors,
        { min: 1, required: true }
      );
      const quantity = parseInteger(
        item?.quantity,
        `sale_items[${index}].quantity`,
        errors,
        { min: 1, required: true }
      );

      if (saleItemNo === null || quantity === null) {
        return;
      }

      const currentQuantity = mergedItems.get(saleItemNo) || 0;
      mergedItems.set(saleItemNo, currentQuantity + quantity);
    });

    return Array.from(mergedItems.entries()).map(([sale_item_no, quantity]) => ({
      quantity,
      sale_item_no,
    }));
  }

  if (fallbackSaleItemNo !== null) {
    return [
      {
        quantity: 1,
        sale_item_no: fallbackSaleItemNo,
      },
    ];
  }

  return [];
}

async function attachSaleItems(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return rows;
  }

  const invoiceIds = rows.map((row) => row.invoice_no);
  const placeholders = invoiceIds.map(() => '?').join(', ');
  const saleItemRows = await all(
    db,
    `
      SELECT
        isi.invoice_no,
        isi.sale_item_no,
        isi.quantity,
        si.details,
        si.make,
        si.model,
        si.price
      FROM Invoice_Sale_Item isi
      LEFT JOIN Sale_Item si ON si.sale_item_no = isi.sale_item_no
      WHERE isi.invoice_no IN (${placeholders})
      ORDER BY isi.invoice_sale_item_id
    `,
    invoiceIds
  );

  const saleItemsByInvoice = saleItemRows.reduce((map, row) => {
    const nextItems = map.get(row.invoice_no) || [];
    nextItems.push({
      details: row.details,
      make: row.make,
      model: row.model,
      price: row.price,
      quantity: row.quantity,
      sale_item_no: row.sale_item_no,
    });
    map.set(row.invoice_no, nextItems);
    return map;
  }, new Map());

  return rows.map((row) => {
    const linkedSaleItems = saleItemsByInvoice.get(row.invoice_no);
    const sale_items =
      linkedSaleItems && linkedSaleItems.length > 0
        ? linkedSaleItems
        : row.sale_item_no
          ? [
              {
                details: row.sale_item_details,
                make: null,
                model: null,
                price: row.sale_item_price,
                quantity: 1,
                sale_item_no: row.sale_item_no,
              },
            ]
          : [];

    const sale_item_summary =
      sale_items.length === 0
        ? ''
        : sale_items
            .map((item) => {
              const label =
                item.details ||
                [item.make, item.model].filter(Boolean).join(' ') ||
                `Sale item #${item.sale_item_no}`;

              return item.quantity > 1 ? `${label} x${item.quantity}` : label;
            })
            .join(', ');

    return {
      ...row,
      sale_item_summary,
      sale_items,
    };
  });
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const sql = `
      SELECT
        i.*,
        c.first_name AS customer_first_name,
        c.last_name AS customer_last_name,
        rj.status AS repair_job_status,
        si.details AS sale_item_details,
        si.price AS sale_item_price
      FROM Invoice i
      LEFT JOIN Customer c ON i.customer_id = c.customer_id
      LEFT JOIN Repair_Job rj ON i.job_no = rj.job_no
      LEFT JOIN Sale_Item si ON i.sale_item_no = si.sale_item_no
      ORDER BY i.invoice_no
    `;

    const rows = await all(db, sql);

    return res.json(await attachSaleItems(rows));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'invoice_no');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      SELECT
        i.*,
        c.first_name AS customer_first_name,
        c.last_name AS customer_last_name,
        rj.status AS repair_job_status,
        si.details AS sale_item_details,
        si.price AS sale_item_price
      FROM Invoice i
      LEFT JOIN Customer c ON i.customer_id = c.customer_id
      LEFT JOIN Repair_Job rj ON i.job_no = rj.job_no
      LEFT JOIN Sale_Item si ON i.sale_item_no = si.sale_item_no
      WHERE i.invoice_no = ?
    `;

    const row = await getOne(db, sql, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const [invoice] = await attachSaleItems([row]);
    return res.json(invoice);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = getInvoicePayload(req.body);

    if (sendValidationErrors(res, payload.errors)) {
      return;
    }

    const result = await withTransaction(db, async () => {
      const sql = `
        INSERT INTO Invoice (
          customer_id,
          job_no,
          sale_item_no,
          total_cost,
          payment_type,
          date_paid
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const invoiceResult = await run(db, sql, [
        payload.customer_id,
        payload.job_no,
        payload.sale_item_no,
        payload.total_cost,
        payload.payment_type,
        payload.date_paid,
      ]);

      for (const saleItem of payload.sale_items) {
        await run(
          db,
          `
            INSERT INTO Invoice_Sale_Item (
              invoice_no,
              sale_item_no,
              quantity
            )
            VALUES (?, ?, ?)
          `,
          [invoiceResult.lastID, saleItem.sale_item_no, saleItem.quantity]
        );
      }

      return invoiceResult;
    });

    return res.status(201).json({
      invoice_no: result.lastID,
      message: 'Invoice created successfully',
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const idValidation = validateIdParam(req.params.id, 'invoice_no');
    const payload = getInvoicePayload(req.body);
    const errors = [...idValidation.errors, ...payload.errors];

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const result = await withTransaction(db, async () => {
      const sql = `
        UPDATE Invoice
        SET
          customer_id = ?,
          job_no = ?,
          sale_item_no = ?,
          total_cost = ?,
          payment_type = ?,
          date_paid = ?
        WHERE invoice_no = ?
      `;

      const updateResult = await run(db, sql, [
        payload.customer_id,
        payload.job_no,
        payload.sale_item_no,
        payload.total_cost,
        payload.payment_type,
        payload.date_paid,
        idValidation.id,
      ]);

      if (updateResult.changes === 0) {
        return updateResult;
      }

      await run(db, 'DELETE FROM Invoice_Sale_Item WHERE invoice_no = ?', [idValidation.id]);

      for (const saleItem of payload.sale_items) {
        await run(
          db,
          `
            INSERT INTO Invoice_Sale_Item (
              invoice_no,
              sale_item_no,
              quantity
            )
            VALUES (?, ?, ?)
          `,
          [idValidation.id, saleItem.sale_item_no, saleItem.quantity]
        );
      }

      return updateResult;
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.json({ message: 'Invoice updated successfully' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'invoice_no');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const result = await withTransaction(db, async () => {
      await run(db, 'DELETE FROM Delivery WHERE invoice_no = ?', [id]);
      await run(db, 'DELETE FROM Invoice_Sale_Item WHERE invoice_no = ?', [id]);
      return run(db, 'DELETE FROM Invoice WHERE invoice_no = ?', [id]);
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.json({ message: 'Invoice deleted successfully' });
  })
);

module.exports = router;
