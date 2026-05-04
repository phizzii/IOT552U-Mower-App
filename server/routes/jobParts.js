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

function getJobPartPayload(body) {
  const errors = [];

  return {
    bill_date: parseDate(body.bill_date, 'bill_date', errors),
    bill_no: normalizeText(body.bill_no),
    charge_price: parseNumber(body.charge_price, 'charge_price', errors, {
      min: 0,
      required: true,
    }),
    errors,
    job_no: parseInteger(body.job_no, 'job_no', errors, {
      min: 1,
      required: true,
    }),
    part_id: parseInteger(body.part_id, 'part_id', errors, {
      min: 1,
      required: true,
    }),
    quantity: parseInteger(body.quantity, 'quantity', errors, {
      min: 1,
      required: true,
    }),
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const errors = [];
    const job_no = parseInteger(req.query.job_no, 'job_no', errors, { min: 1 });
    const part_id = parseInteger(req.query.part_id, 'part_id', errors, { min: 1 });

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const whereClauses = [];
    const params = [];

    if (job_no !== null) {
      whereClauses.push('jp.job_no = ?');
      params.push(job_no);
    }

    if (part_id !== null) {
      whereClauses.push('jp.part_id = ?');
      params.push(part_id);
    }

    const sql = `
      SELECT
        jp.*,
        p.part_description
      FROM Job_Part jp
      LEFT JOIN Part p ON jp.part_id = p.part_id
      ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''}
      ORDER BY jp.job_part_id
    `;

    const rows = await all(db, sql, params);

    return res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'job_part_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      SELECT
        jp.*,
        p.part_description
      FROM Job_Part jp
      LEFT JOIN Part p ON jp.part_id = p.part_id
      WHERE jp.job_part_id = ?
    `;

    const row = await getOne(db, sql, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Job part not found' });
    }

    return res.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = getJobPartPayload(req.body);

    if (sendValidationErrors(res, payload.errors)) {
      return;
    }

    const sql = `
      INSERT INTO Job_Part (
        job_no,
        part_id,
        quantity,
        bill_no,
        bill_date,
        charge_price
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await run(db, sql, [
      payload.job_no,
      payload.part_id,
      payload.quantity,
      payload.bill_no,
      payload.bill_date,
      payload.charge_price,
    ]);

    return res.status(201).json({
      job_part_id: result.lastID,
      message: 'Job part created successfully',
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const idValidation = validateIdParam(req.params.id, 'job_part_id');
    const payload = getJobPartPayload(req.body);
    const errors = [...idValidation.errors, ...payload.errors];

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      UPDATE Job_Part
      SET
        job_no = ?,
        part_id = ?,
        quantity = ?,
        bill_no = ?,
        bill_date = ?,
        charge_price = ?
      WHERE job_part_id = ?
    `;

    const result = await run(db, sql, [
      payload.job_no,
      payload.part_id,
      payload.quantity,
      payload.bill_no,
      payload.bill_date,
      payload.charge_price,
      idValidation.id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job part not found' });
    }

    return res.json({ message: 'Job part updated successfully' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'job_part_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'DELETE FROM Job_Part WHERE job_part_id = ?';
    const result = await run(db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job part not found' });
    }

    return res.json({ message: 'Job part deleted successfully' });
  })
);

module.exports = router;
