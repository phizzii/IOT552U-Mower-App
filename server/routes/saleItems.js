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

function getSaleItemPayload(body) {
  const errors = [];

  return {
    customer_id: parseInteger(body.customer_id, 'customer_id', errors, {
      min: 1,
      required: true,
    }),
    date_sold: parseDate(body.date_sold, 'date_sold', errors),
    details: normalizeText(body.details),
    errors,
    make: normalizeText(body.make),
    model: normalizeText(body.model),
    payment_type: normalizeText(body.payment_type),
    price: parseNumber(body.price, 'price', errors, { min: 0 }),
    type: normalizeText(body.type),
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const sql = `
      SELECT
        si.*,
        c.first_name AS customer_first_name,
        c.last_name AS customer_last_name
      FROM Sale_Item si
      LEFT JOIN Customer c ON si.customer_id = c.customer_id
      ORDER BY si.sale_item_no
    `;

    const rows = await all(db, sql);

    return res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'sale_item_no');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      SELECT
        si.*,
        c.first_name AS customer_first_name,
        c.last_name AS customer_last_name
      FROM Sale_Item si
      LEFT JOIN Customer c ON si.customer_id = c.customer_id
      WHERE si.sale_item_no = ?
    `;

    const row = await getOne(db, sql, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Sale item not found' });
    }

    return res.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = getSaleItemPayload(req.body);

    if (sendValidationErrors(res, payload.errors)) {
      return;
    }

    const sql = `
      INSERT INTO Sale_Item (
        customer_id,
        make,
        model,
        type,
        details,
        price,
        date_sold,
        payment_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await run(db, sql, [
      payload.customer_id,
      payload.make,
      payload.model,
      payload.type,
      payload.details,
      payload.price,
      payload.date_sold,
      payload.payment_type,
    ]);

    return res.status(201).json({
      message: 'Sale item created successfully',
      sale_item_no: result.lastID,
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const idValidation = validateIdParam(req.params.id, 'sale_item_no');
    const payload = getSaleItemPayload(req.body);
    const errors = [...idValidation.errors, ...payload.errors];

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      UPDATE Sale_Item
      SET
        customer_id = ?,
        make = ?,
        model = ?,
        type = ?,
        details = ?,
        price = ?,
        date_sold = ?,
        payment_type = ?
      WHERE sale_item_no = ?
    `;

    const result = await run(db, sql, [
      payload.customer_id,
      payload.make,
      payload.model,
      payload.type,
      payload.details,
      payload.price,
      payload.date_sold,
      payload.payment_type,
      idValidation.id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Sale item not found' });
    }

    return res.json({ message: 'Sale item updated successfully' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'sale_item_no');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'DELETE FROM Sale_Item WHERE sale_item_no = ?';
    const result = await run(db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Sale item not found' });
    }

    return res.json({ message: 'Sale item deleted successfully' });
  })
);

module.exports = router;
