const express = require('express');
const router = express.Router();
const db = require('../db/db');
const {
  all,
  asyncHandler,
  getOne,
  normalizeText,
  parseInteger,
  parseNumber,
  run,
  sendValidationErrors,
  validateIdParam,
} = require('../utils/routeHelpers');

function getServicePayload(body) {
  const errors = [];

  return {
    errors,
    machine_type_id: parseInteger(body.machine_type_id, 'machine_type_id', errors, {
      min: 1,
      required: true,
    }),
    price: parseNumber(body.price, 'price', errors, { min: 0 }),
    service_description: normalizeText(body.service_description),
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const sql = `
      SELECT
        s.*,
        mt.type_name AS machine_type_name
      FROM Service s
      LEFT JOIN Machine_Type mt ON s.machine_type_id = mt.machine_type_id
      ORDER BY s.service_id
    `;

    const rows = await all(db, sql);

    return res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'service_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      SELECT
        s.*,
        mt.type_name AS machine_type_name
      FROM Service s
      LEFT JOIN Machine_Type mt ON s.machine_type_id = mt.machine_type_id
      WHERE s.service_id = ?
    `;

    const row = await getOne(db, sql, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Service not found' });
    }

    return res.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = getServicePayload(req.body);

    if (sendValidationErrors(res, payload.errors)) {
      return;
    }

    const sql = `
      INSERT INTO Service (
        machine_type_id,
        service_description,
        price
      )
      VALUES (?, ?, ?)
    `;

    const result = await run(db, sql, [
      payload.machine_type_id,
      payload.service_description,
      payload.price,
    ]);

    return res.status(201).json({
      message: 'Service created successfully',
      service_id: result.lastID,
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const idValidation = validateIdParam(req.params.id, 'service_id');
    const payload = getServicePayload(req.body);
    const errors = [...idValidation.errors, ...payload.errors];

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      UPDATE Service
      SET
        machine_type_id = ?,
        service_description = ?,
        price = ?
      WHERE service_id = ?
    `;

    const result = await run(db, sql, [
      payload.machine_type_id,
      payload.service_description,
      payload.price,
      idValidation.id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    return res.json({ message: 'Service updated successfully' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'service_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'DELETE FROM Service WHERE service_id = ?';
    const result = await run(db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    return res.json({ message: 'Service deleted successfully' });
  })
);

module.exports = router;
