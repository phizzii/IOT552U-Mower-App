const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const sql = `
    SELECT
      si.*,
      c.first_name AS customer_first_name,
      c.last_name AS customer_last_name
    FROM Sale_Item si
    LEFT JOIN Customer c ON si.customer_id = c.customer_id
    ORDER BY si.sale_item_no
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
      si.*,
      c.first_name AS customer_first_name,
      c.last_name AS customer_last_name
    FROM Sale_Item si
    LEFT JOIN Customer c ON si.customer_id = c.customer_id
    WHERE si.sale_item_no = ?
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Sale item not found' });
    }

    return res.json(row);
  });
});

router.post('/', (req, res) => {
  const {
    customer_id,
    make,
    model,
    type,
    details,
    price,
    date_sold,
    payment_type,
  } = req.body;

  if (!customer_id) {
    return res.status(400).json({ error: 'customer_id is required' });
  }

  const sql = `
    INSERT INTO Sale_Item (
      customer_id,
      make,
      model,
      type,
      details,
      price,
      date_sold,
      payment_type
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    customer_id,
    make,
    model,
    type,
    details,
    price,
    date_sold,
    payment_type,
  ];

  db.run(sql, params, function onInsert(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(201).json({
      message: 'Sale item created successfully',
      sale_item_no: this.lastID,
    });
  });
});

router.put('/:id', (req, res) => {
  const {
    customer_id,
    make,
    model,
    type,
    details,
    price,
    date_sold,
    payment_type,
  } = req.body;

  if (!customer_id) {
    return res.status(400).json({ error: 'customer_id is required' });
  }

  const sql = `
    UPDATE Sale_Item
    SET
      customer_id = ?,
      make = ?,
      model = ?,
      type = ?,
      details = ?,
      price = ?,
      date_sold = ?,
      payment_type = ?
    WHERE sale_item_no = ?
  `;

  const params = [
    customer_id,
    make,
    model,
    type,
    details,
    price,
    date_sold,
    payment_type,
    req.params.id,
  ];

  db.run(sql, params, function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Sale item not found' });
    }

    return res.json({ message: 'Sale item updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM Sale_Item WHERE sale_item_no = ?';

  db.run(sql, [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Sale item not found' });
    }

    return res.json({ message: 'Sale item deleted successfully' });
  });
});

module.exports = router;
