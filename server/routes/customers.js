const express = require('express');
const router = express.Router();
const db = require('../db/db');
const {
  all,
  asyncHandler,
  getOne,
  normalizeText,
  run,
  sendValidationErrors,
  validateIdParam,
} = require('../utils/routeHelpers');

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
      normalizeText(req.body.first_name),
      normalizeText(req.body.last_name),
      normalizeText(req.body.phone_number),
      normalizeText(req.body.address_line_1),
      normalizeText(req.body.address_line_2),
      normalizeText(req.body.address_line_3),
      normalizeText(req.body.postcode),
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

    if (sendValidationErrors(res, errors)) {
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
      normalizeText(req.body.first_name),
      normalizeText(req.body.last_name),
      normalizeText(req.body.phone_number),
      normalizeText(req.body.address_line_1),
      normalizeText(req.body.address_line_2),
      normalizeText(req.body.address_line_3),
      normalizeText(req.body.postcode),
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
