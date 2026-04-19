const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const sql = `
    SELECT
      d.*,
      i.total_cost AS invoice_total_cost,
      i.payment_type AS invoice_payment_type
    FROM Delivery d
    LEFT JOIN Invoice i ON d.invoice_no = i.invoice_no
    ORDER BY d.delivery_id
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
      d.*,
      i.total_cost AS invoice_total_cost,
      i.payment_type AS invoice_payment_type
    FROM Delivery d
    LEFT JOIN Invoice i ON d.invoice_no = i.invoice_no
    WHERE d.delivery_id = ?
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    return res.json(row);
  });
});

router.post('/', (req, res) => {
  const {
    invoice_no,
    fuel_price_per_litre,
    driver_cost_per_hour,
    miles_to_address,
    time_to_address,
    charge,
  } = req.body;

  if (!invoice_no) {
    return res.status(400).json({ error: 'invoice_no is required' });
  }

  const sql = `
    INSERT INTO Delivery (
      invoice_no,
      fuel_price_per_litre,
      driver_cost_per_hour,
      miles_to_address,
      time_to_address,
      charge
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [
    invoice_no,
    fuel_price_per_litre,
    driver_cost_per_hour,
    miles_to_address,
    time_to_address,
    charge,
  ];

  db.run(sql, params, function onInsert(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(201).json({
      message: 'Delivery created successfully',
      delivery_id: this.lastID,
    });
  });
});

router.put('/:id', (req, res) => {
  const {
    invoice_no,
    fuel_price_per_litre,
    driver_cost_per_hour,
    miles_to_address,
    time_to_address,
    charge,
  } = req.body;

  if (!invoice_no) {
    return res.status(400).json({ error: 'invoice_no is required' });
  }

  const sql = `
    UPDATE Delivery
    SET
      invoice_no = ?,
      fuel_price_per_litre = ?,
      driver_cost_per_hour = ?,
      miles_to_address = ?,
      time_to_address = ?,
      charge = ?
    WHERE delivery_id = ?
  `;

  const params = [
    invoice_no,
    fuel_price_per_litre,
    driver_cost_per_hour,
    miles_to_address,
    time_to_address,
    charge,
    req.params.id,
  ];

  db.run(sql, params, function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    return res.json({ message: 'Delivery updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM Delivery WHERE delivery_id = ?';

  db.run(sql, [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    return res.json({ message: 'Delivery deleted successfully' });
  });
});

module.exports = router;
