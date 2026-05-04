const express = require('express');
const router = express.Router();
const db = require('../db/db');
const {
  all,
  asyncHandler,
  getOne,
  parseDate,
  parseInteger,
  parseText,
  run,
  sendValidationErrors,
  validateIdParam,
} = require('../utils/routeHelpers');

function getRepairJobPayload(body) {
  const errors = [];

  return {
    assigned_mechanic: parseText(body.assigned_mechanic, 'assigned_mechanic', errors, {
      required: true,
    }),
    contact_method: parseText(body.contact_method, 'contact_method', errors),
    customer_id: parseInteger(body.customer_id, 'customer_id', errors, {
      min: 1,
      required: true,
    }),
    date_collected: parseDate(body.date_collected, 'date_collected', errors),
    date_finished: parseDate(body.date_finished, 'date_finished', errors),
    date_logged: parseDate(body.date_logged, 'date_logged', errors, {
      required: true,
    }),
    date_return: parseDate(body.date_return, 'date_return', errors),
    errors,
    instruction: parseText(body.instruction, 'instruction', errors, { required: true }),
    machine_id: parseInteger(body.machine_id, 'machine_id', errors, {
      min: 1,
      required: true,
    }),
    notes: parseText(body.notes, 'notes', errors),
    status: parseText(body.status, 'status', errors, { required: true }),
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const sql = `
      SELECT
        rj.*,
        c.first_name AS customer_first_name,
        c.last_name AS customer_last_name,
        m.make AS machine_make,
        m.model_no AS machine_model_no,
        m.serial_no AS machine_serial_no
      FROM Repair_Job rj
      LEFT JOIN Customer c ON rj.customer_id = c.customer_id
      LEFT JOIN Machine m ON rj.machine_id = m.machine_id
      ORDER BY rj.job_no
    `;

    const rows = await all(db, sql);

    return res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'job_no');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      SELECT
        rj.*,
        c.first_name AS customer_first_name,
        c.last_name AS customer_last_name,
        m.make AS machine_make,
        m.model_no AS machine_model_no,
        m.serial_no AS machine_serial_no
      FROM Repair_Job rj
      LEFT JOIN Customer c ON rj.customer_id = c.customer_id
      LEFT JOIN Machine m ON rj.machine_id = m.machine_id
      WHERE rj.job_no = ?
    `;

    const row = await getOne(db, sql, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Repair job not found' });
    }

    return res.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = getRepairJobPayload(req.body);

    if (sendValidationErrors(res, payload.errors)) {
      return;
    }

    const sql = `
      INSERT INTO Repair_Job (
        customer_id,
        machine_id,
        date_logged,
        date_collected,
        instruction,
        notes,
        status,
        assigned_mechanic,
        date_finished,
        contact_method,
        date_return
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await run(db, sql, [
      payload.customer_id,
      payload.machine_id,
      payload.date_logged,
      payload.date_collected,
      payload.instruction,
      payload.notes,
      payload.status,
      payload.assigned_mechanic,
      payload.date_finished,
      payload.contact_method,
      payload.date_return,
    ]);

    return res.status(201).json({
      job_no: result.lastID,
      message: 'Repair job created successfully',
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const idValidation = validateIdParam(req.params.id, 'job_no');
    const payload = getRepairJobPayload(req.body);
    const errors = [...idValidation.errors, ...payload.errors];

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      UPDATE Repair_Job
      SET
        customer_id = ?,
        machine_id = ?,
        date_logged = ?,
        date_collected = ?,
        instruction = ?,
        notes = ?,
        status = ?,
        assigned_mechanic = ?,
        date_finished = ?,
        contact_method = ?,
        date_return = ?
      WHERE job_no = ?
    `;

    const result = await run(db, sql, [
      payload.customer_id,
      payload.machine_id,
      payload.date_logged,
      payload.date_collected,
      payload.instruction,
      payload.notes,
      payload.status,
      payload.assigned_mechanic,
      payload.date_finished,
      payload.contact_method,
      payload.date_return,
      idValidation.id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Repair job not found' });
    }

    return res.json({ message: 'Repair job updated successfully' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'job_no');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'DELETE FROM Repair_Job WHERE job_no = ?';
    const result = await run(db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Repair job not found' });
    }

    return res.json({ message: 'Repair job deleted successfully' });
  })
);

module.exports = router;
