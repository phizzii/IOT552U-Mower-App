const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
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

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.json(rows);
  });
});

router.get('/:id', (req, res) => {
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

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Repair job not found' });
    }

    return res.json(row);
  });
});

router.post('/', (req, res) => {
  const {
    customer_id,
    machine_id,
    date_logged,
    date_collected,
    instruction,
    notes,
    status,
    date_finished,
    contact_method,
    date_return,
  } = req.body;

  if (!customer_id || !machine_id) {
    return res.status(400).json({
      error: 'customer_id and machine_id are required',
    });
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
      date_finished,
      contact_method,
      date_return
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    customer_id,
    machine_id,
    date_logged,
    date_collected,
    instruction,
    notes,
    status,
    date_finished,
    contact_method,
    date_return,
  ];

  db.run(sql, params, function onInsert(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(201).json({
      message: 'Repair job created successfully',
      job_no: this.lastID,
    });
  });
});

router.put('/:id', (req, res) => {
  const {
    customer_id,
    machine_id,
    date_logged,
    date_collected,
    instruction,
    notes,
    status,
    date_finished,
    contact_method,
    date_return,
  } = req.body;

  if (!customer_id || !machine_id) {
    return res.status(400).json({
      error: 'customer_id and machine_id are required',
    });
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
      date_finished = ?,
      contact_method = ?,
      date_return = ?
    WHERE job_no = ?
  `;

  const params = [
    customer_id,
    machine_id,
    date_logged,
    date_collected,
    instruction,
    notes,
    status,
    date_finished,
    contact_method,
    date_return,
    req.params.id,
  ];

  db.run(sql, params, function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Repair job not found' });
    }

    return res.json({ message: 'Repair job updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM Repair_Job WHERE job_no = ?';

  db.run(sql, [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Repair job not found' });
    }

    return res.json({ message: 'Repair job deleted successfully' });
  });
});

module.exports = router;
