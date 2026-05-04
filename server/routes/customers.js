const express = require('express');
const router = express.Router();
const db = require('../db/db');
const {
  all,
  asyncHandler,
  getOne,
  parseText,
  run,
  sendValidationErrors,
  validateIdParam,
} = require('../utils/routeHelpers');

function getCustomerPayload(body) {
  const errors = [];

  return {
    address_line_1: parseText(body.address_line_1, 'address_line_1', errors),
    address_line_2: parseText(body.address_line_2, 'address_line_2', errors),
    address_line_3: parseText(body.address_line_3, 'address_line_3', errors),
    errors,
    first_name: parseText(body.first_name, 'first_name', errors, { required: true }),
    last_name: parseText(body.last_name, 'last_name', errors, { required: true }),
    phone_number: parseText(body.phone_number, 'phone_number', errors),
    postcode: parseText(body.postcode, 'postcode', errors),
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const sql = 'SELECT * FROM Customer ORDER BY customer_id';
    const rows = await all(db, sql);

    return res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'customer_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'SELECT * FROM Customer WHERE customer_id = ?';
    const row = await getOne(db, sql, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = getCustomerPayload(req.body);

    if (sendValidationErrors(res, payload.errors)) {
      return;
    }

    const sql = `
      INSERT INTO Customer (
        first_name,
        last_name,
        phone_number,
        address_line_1,
        address_line_2,
        address_line_3,
        postcode
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      payload.first_name,
      payload.last_name,
      payload.phone_number,
      payload.address_line_1,
      payload.address_line_2,
      payload.address_line_3,
      payload.postcode,
    ];

    const result = await run(db, sql, params);

    return res.status(201).json({
      message: 'Customer created successfully',
      customer_id: result.lastID,
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'customer_id');
    const payload = getCustomerPayload(req.body);
    const validationErrors = [...errors, ...payload.errors];

    if (sendValidationErrors(res, validationErrors)) {
      return;
    }

    const sql = `
      UPDATE Customer
      SET
        first_name = ?,
        last_name = ?,
        phone_number = ?,
        address_line_1 = ?,
        address_line_2 = ?,
        address_line_3 = ?,
        postcode = ?
      WHERE customer_id = ?
    `;

    const params = [
      payload.first_name,
      payload.last_name,
      payload.phone_number,
      payload.address_line_1,
      payload.address_line_2,
      payload.address_line_3,
      payload.postcode,
      id,
    ];

    const result = await run(db, sql, params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({ message: 'Customer updated successfully' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'customer_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'DELETE FROM Customer WHERE customer_id = ?';
    const result = await run(db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({ message: 'Customer deleted successfully' });
  })
);

module.exports = router;
