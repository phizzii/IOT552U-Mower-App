const express = require('express');
const router = express.Router();
const db = require('../db/db');
const {
  all,
  asyncHandler,
  getOne,
  parseNumber,
  parseText,
  run,
  sendValidationErrors,
  validateIdParam,
} = require('../utils/routeHelpers');

function getPartPayload(body) {
  const errors = [];

  return {
    errors,
    part_description: parseText(body.part_description, 'part_description', errors, {
      required: true,
    }),
    retail_price: parseNumber(body.retail_price, 'retail_price', errors, {
      min: 0,
    }),
    supplier_cost: parseNumber(body.supplier_cost, 'supplier_cost', errors, {
      min: 0,
    }),
    supplier_name: parseText(body.supplier_name, 'supplier_name', errors),
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const sql = 'SELECT * FROM Part ORDER BY part_id';
    const rows = await all(db, sql);

    return res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'part_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'SELECT * FROM Part WHERE part_id = ?';
    const row = await getOne(db, sql, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Part not found' });
    }

    return res.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = getPartPayload(req.body);

    if (sendValidationErrors(res, payload.errors)) {
      return;
    }

    const sql = `
      INSERT INTO Part (
        part_description,
        supplier_name,
        supplier_cost,
        retail_price
      )
      VALUES (?, ?, ?, ?)
    `;

    const result = await run(db, sql, [
      payload.part_description,
      payload.supplier_name,
      payload.supplier_cost,
      payload.retail_price,
    ]);

    return res.status(201).json({
      message: 'Part created successfully',
      part_id: result.lastID,
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const idValidation = validateIdParam(req.params.id, 'part_id');
    const payload = getPartPayload(req.body);
    const errors = [...idValidation.errors, ...payload.errors];

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      UPDATE Part
      SET
        part_description = ?,
        supplier_name = ?,
        supplier_cost = ?,
        retail_price = ?
      WHERE part_id = ?
    `;

    const result = await run(db, sql, [
      payload.part_description,
      payload.supplier_name,
      payload.supplier_cost,
      payload.retail_price,
      idValidation.id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }

    return res.json({ message: 'Part updated successfully' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'part_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'DELETE FROM Part WHERE part_id = ?';
    const result = await run(db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }

    return res.json({ message: 'Part deleted successfully' });
  })
);

module.exports = router;
