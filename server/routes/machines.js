const express = require('express');
const router = express.Router();
const db = require('../db/db');
const {
  all,
  asyncHandler,
  getOne,
  parseInteger,
  parseText,
  run,
  sendValidationErrors,
  validateIdParam,
} = require('../utils/routeHelpers');

function getMachinePayload(body) {
  const errors = [];

  return {
    customer_id: parseInteger(body.customer_id, 'customer_id', errors, {
      min: 1,
      required: true,
    }),
    errors,
    machine_type_id: parseInteger(
      body.machine_type_id,
      'machine_type_id',
      errors,
      {
        min: 1,
        required: true,
      }
    ),
    make: parseText(body.make, 'make', errors, { required: true }),
    model_no: parseText(body.model_no, 'model_no', errors, { required: true }),
    other_no: parseText(body.other_no, 'other_no', errors),
    serial_no: parseText(body.serial_no, 'serial_no', errors),
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const sql = `
      SELECT
        m.*,
        c.first_name AS customer_first_name,
        c.last_name AS customer_last_name,
        mt.type_name AS machine_type_name
      FROM Machine m
      LEFT JOIN Customer c ON m.customer_id = c.customer_id
      LEFT JOIN Machine_Type mt ON m.machine_type_id = mt.machine_type_id
      ORDER BY m.machine_id
    `;

    const rows = await all(db, sql);

    return res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'machine_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      SELECT
        m.*,
        c.first_name AS customer_first_name,
        c.last_name AS customer_last_name,
        mt.type_name AS machine_type_name
      FROM Machine m
      LEFT JOIN Customer c ON m.customer_id = c.customer_id
      LEFT JOIN Machine_Type mt ON m.machine_type_id = mt.machine_type_id
      WHERE m.machine_id = ?
    `;

    const row = await getOne(db, sql, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    return res.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = getMachinePayload(req.body);

    if (sendValidationErrors(res, payload.errors)) {
      return;
    }

    const sql = `
      INSERT INTO Machine (
        customer_id,
        machine_type_id,
        make,
        model_no,
        serial_no,
        other_no
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await run(db, sql, [
      payload.customer_id,
      payload.machine_type_id,
      payload.make,
      payload.model_no,
      payload.serial_no,
      payload.other_no,
    ]);

    return res.status(201).json({
      machine_id: result.lastID,
      message: 'Machine created successfully',
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const idValidation = validateIdParam(req.params.id, 'machine_id');
    const payload = getMachinePayload(req.body);
    const errors = [...idValidation.errors, ...payload.errors];

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      UPDATE Machine
      SET
        customer_id = ?,
        machine_type_id = ?,
        make = ?,
        model_no = ?,
        serial_no = ?,
        other_no = ?
      WHERE machine_id = ?
    `;

    const result = await run(db, sql, [
      payload.customer_id,
      payload.machine_type_id,
      payload.make,
      payload.model_no,
      payload.serial_no,
      payload.other_no,
      idValidation.id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    return res.json({ message: 'Machine updated successfully' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'machine_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'DELETE FROM Machine WHERE machine_id = ?';
    const result = await run(db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    return res.json({ message: 'Machine deleted successfully' });
  })
);

module.exports = router;
