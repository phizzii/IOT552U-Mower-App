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

  if (job_no === null && sale_item_no === null) {
    errors.push('At least one of job_no or sale_item_no is required');
  }

  return {
    customer_id,
    date_paid: parseDate(body.date_paid, 'date_paid', errors),
    errors,
    job_no,
    payment_type: normalizeText(body.payment_type),
    sale_item_no,
    total_cost: parseNumber(body.total_cost, 'total_cost', errors, { min: 0 }),
  };
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
        si.details AS sale_item_details
      FROM Invoice i
      LEFT JOIN Customer c ON i.customer_id = c.customer_id
      LEFT JOIN Repair_Job rj ON i.job_no = rj.job_no
      LEFT JOIN Sale_Item si ON i.sale_item_no = si.sale_item_no
      ORDER BY i.invoice_no
    `;

    const rows = await all(db, sql);

    return res.json(rows);
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
        si.details AS sale_item_details
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

    return res.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = getInvoicePayload(req.body);

    if (sendValidationErrors(res, payload.errors)) {
      return;
    }

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

    const result = await run(db, sql, [
      payload.customer_id,
      payload.job_no,
      payload.sale_item_no,
      payload.total_cost,
      payload.payment_type,
      payload.date_paid,
    ]);

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

    const result = await run(db, sql, [
      payload.customer_id,
      payload.job_no,
      payload.sale_item_no,
      payload.total_cost,
      payload.payment_type,
      payload.date_paid,
      idValidation.id,
    ]);

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

    const sql = 'DELETE FROM Invoice WHERE invoice_no = ?';
    const result = await run(db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.json({ message: 'Invoice deleted successfully' });
  })
);

module.exports = router;
