const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
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
      m.*,
      c.first_name AS customer_first_name,
      c.last_name AS customer_last_name,
      mt.type_name AS machine_type_name
    FROM Machine m
    LEFT JOIN Customer c ON m.customer_id = c.customer_id
    LEFT JOIN Machine_Type mt ON m.machine_type_id = mt.machine_type_id
    WHERE m.machine_id = ?
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    return res.json(row);
  });
});

router.post('/', (req, res) => {
  const {
    customer_id,
    machine_type_id,
    make,
    model_no,
    serial_no,
    other_no,
  } = req.body;

  if (!customer_id || !machine_type_id) {
    return res.status(400).json({
      error: 'customer_id and machine_type_id are required',
    });
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

  const params = [
    customer_id,
    machine_type_id,
    make,
    model_no,
    serial_no,
    other_no,
  ];

  db.run(sql, params, function onInsert(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(201).json({
      message: 'Machine created successfully',
      machine_id: this.lastID,
    });
  });
});

router.put('/:id', (req, res) => {
  const {
    customer_id,
    machine_type_id,
    make,
    model_no,
    serial_no,
    other_no,
  } = req.body;

  if (!customer_id || !machine_type_id) {
    return res.status(400).json({
      error: 'customer_id and machine_type_id are required',
    });
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

  const params = [
    customer_id,
    machine_type_id,
    make,
    model_no,
    serial_no,
    other_no,
    req.params.id,
  ];

  db.run(sql, params, function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    return res.json({ message: 'Machine updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM Machine WHERE machine_id = ?';

  db.run(sql, [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    return res.json({ message: 'Machine deleted successfully' });
  });
});

module.exports = router;
