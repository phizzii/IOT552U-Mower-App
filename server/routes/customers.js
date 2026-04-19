const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const sql = 'SELECT * FROM Customer ORDER BY customer_id';

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM Customer WHERE customer_id = ?';

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json(row);
  });
});

router.post('/', (req, res) => {
  const {
    first_name,
    last_name,
    phone_number,
    address_line_1,
    address_line_2,
    address_line_3,
    postcode,
  } = req.body;

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
    first_name,
    last_name,
    phone_number,
    address_line_1,
    address_line_2,
    address_line_3,
    postcode,
  ];

  db.run(sql, params, function onInsert(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(201).json({
      message: 'Customer created successfully',
      customer_id: this.lastID,
    });
  });
});

router.put('/:id', (req, res) => {
  const {
    first_name,
    last_name,
    phone_number,
    address_line_1,
    address_line_2,
    address_line_3,
    postcode,
  } = req.body;

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
    first_name,
    last_name,
    phone_number,
    address_line_1,
    address_line_2,
    address_line_3,
    postcode,
    req.params.id,
  ];

  db.run(sql, params, function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({ message: 'Customer updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM Customer WHERE customer_id = ?';

  db.run(sql, [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({ message: 'Customer deleted successfully' });
  });
});

module.exports = router;
