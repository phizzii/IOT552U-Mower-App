const express = require('express');
const router = express.Router();
const db = require('../db/db');
const {
  all,
  asyncHandler,
  getOne,
  parseInteger,
  parseNumber,
  parseText,
  run,
  sendValidationErrors,
  validateIdParam,
} = require('../utils/routeHelpers');

function getJobLineItemPayload(body) {
  const errors = [];
  const description = parseText(body.description, 'description', errors);
  const service_id = parseInteger(body.service_id, 'service_id', errors, { min: 1 });

  if (description === null && service_id === null) {
    errors.push('Either service_id or description is required');
  }

  return {
    description,
    errors,
    hourly_rate: parseNumber(body.hourly_rate, 'hourly_rate', errors, {
      min: 0,
    }),
    job_id: parseInteger(body.job_id, 'job_id', errors, {
      min: 1,
      required: true,
    }),
    labour_hours: parseNumber(body.labour_hours, 'labour_hours', errors, {
      min: 0,
    }),
    line_total: parseNumber(body.line_total, 'line_total', errors, {
      min: 0,
      required: true,
    }),
    service_id,
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const errors = [];
    const job_id = parseInteger(req.query.job_id, 'job_id', errors, { min: 1 });
    const service_id = parseInteger(req.query.service_id, 'service_id', errors, {
      min: 1,
    });

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const whereClauses = [];
    const params = [];

    if (job_id !== null) {
      whereClauses.push('jli.job_id = ?');
      params.push(job_id);
    }

    if (service_id !== null) {
      whereClauses.push('jli.service_id = ?');
      params.push(service_id);
    }

    const sql = `
      SELECT
        jli.*,
        rj.job_no,
        s.service_description
      FROM Job_Line_Item jli
      LEFT JOIN Repair_Job rj ON jli.job_id = rj.job_no
      LEFT JOIN Service s ON jli.service_id = s.service_id
      ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''}
      ORDER BY jli.line_item_id
    `;

    const rows = await all(db, sql, params);

    return res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'line_item_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      SELECT
        jli.*,
        rj.job_no,
        s.service_description
      FROM Job_Line_Item jli
      LEFT JOIN Repair_Job rj ON jli.job_id = rj.job_no
      LEFT JOIN Service s ON jli.service_id = s.service_id
      WHERE jli.line_item_id = ?
    `;

    const row = await getOne(db, sql, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Job line item not found' });
    }

    return res.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = getJobLineItemPayload(req.body);

    if (sendValidationErrors(res, payload.errors)) {
      return;
    }

    const sql = `
      INSERT INTO Job_Line_Item (
        job_id,
        service_id,
        description,
        labour_hours,
        hourly_rate,
        line_total
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await run(db, sql, [
      payload.job_id,
      payload.service_id,
      payload.description,
      payload.labour_hours,
      payload.hourly_rate,
      payload.line_total,
    ]);

    return res.status(201).json({
      line_item_id: result.lastID,
      message: 'Job line item created successfully',
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const idValidation = validateIdParam(req.params.id, 'line_item_id');
    const payload = getJobLineItemPayload(req.body);
    const errors = [...idValidation.errors, ...payload.errors];

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      UPDATE Job_Line_Item
      SET
        job_id = ?,
        service_id = ?,
        description = ?,
        labour_hours = ?,
        hourly_rate = ?,
        line_total = ?
      WHERE line_item_id = ?
    `;

    const result = await run(db, sql, [
      payload.job_id,
      payload.service_id,
      payload.description,
      payload.labour_hours,
      payload.hourly_rate,
      payload.line_total,
      idValidation.id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job line item not found' });
    }

    return res.json({ message: 'Job line item updated successfully' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'line_item_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'DELETE FROM Job_Line_Item WHERE line_item_id = ?';
    const result = await run(db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job line item not found' });
    }

    return res.json({ message: 'Job line item deleted successfully' });
  })
);

module.exports = router;
