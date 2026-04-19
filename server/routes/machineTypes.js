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
  validateRequired,
} = require('../utils/routeHelpers');

function getMachineTypePayload(body) {
  const errors = validateRequired(body, ['type_name']);

  return {
    errors,
    type_name: normalizeText(body.type_name),
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const sql = 'SELECT * FROM Machine_Type ORDER BY machine_type_id';
    const rows = await all(db, sql);

    return res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'machine_type_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'SELECT * FROM Machine_Type WHERE machine_type_id = ?';
    const row = await getOne(db, sql, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Machine type not found' });
    }

    return res.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { errors, type_name } = getMachineTypePayload(req.body);

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'INSERT INTO Machine_Type (type_name) VALUES (?)';
    const result = await run(db, sql, [type_name]);

    return res.status(201).json({
      message: 'Machine type created successfully',
      machine_type_id: result.lastID,
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const idValidation = validateIdParam(req.params.id, 'machine_type_id');
    const payload = getMachineTypePayload(req.body);
    const errors = [...idValidation.errors, ...payload.errors];

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      UPDATE Machine_Type
      SET type_name = ?
      WHERE machine_type_id = ?
    `;

    const result = await run(db, sql, [payload.type_name, idValidation.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Machine type not found' });
    }

    return res.json({ message: 'Machine type updated successfully' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'machine_type_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'DELETE FROM Machine_Type WHERE machine_type_id = ?';
    const result = await run(db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Machine type not found' });
    }

    return res.json({ message: 'Machine type deleted successfully' });
  })
);

module.exports = router;
