const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const sql = `
    SELECT
      i.*,
      c.first_name AS customer_first_name,
      c.last_name AS customer_last_name,
      rj.status AS repair_job_status,
      si.details AS sale_item_details
    FROM Invoice i
    LEFT JOIN Customer c ON i.customer_id = c.customer_id
    LEFT JOIN Repair_Job rj ON i.job_no = rj.job_no
    LEFT JOIN Sale_Item si ON i.sale_item_no = si.sale_item_no
    ORDER BY i.invoice_no
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
      i.*,
      c.first_name AS customer_first_name,
      c.last_name AS customer_last_name,
      rj.status AS repair_job_status,
      si.details AS sale_item_details
    FROM Invoice i
    LEFT JOIN Customer c ON i.customer_id = c.customer_id
    LEFT JOIN Repair_Job rj ON i.job_no = rj.job_no
    LEFT JOIN Sale_Item si ON i.sale_item_no = si.sale_item_no
    WHERE i.invoice_no = ?
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.json(row);
  });
});

router.post('/', (req, res) => {
  const {
    customer_id,
    job_no,
    sale_item_no,
    total_cost,
    payment_type,
    date_paid,
  } = req.body;

  if (!customer_id) {
    return res.status(400).json({ error: 'customer_id is required' });
  }

  const sql = `
    INSERT INTO Invoice (
      customer_id,
      job_no,
      sale_item_no,
      total_cost,
      payment_type,
      date_paid
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [
    customer_id,
    job_no,
    sale_item_no,
    total_cost,
    payment_type,
    date_paid,
  ];

  db.run(sql, params, function onInsert(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(201).json({
      message: 'Invoice created successfully',
      invoice_no: this.lastID,
    });
  });
});

router.put('/:id', (req, res) => {
  const {
    customer_id,
    job_no,
    sale_item_no,
    total_cost,
    payment_type,
    date_paid,
  } = req.body;

  if (!customer_id) {
    return res.status(400).json({ error: 'customer_id is required' });
  }

  const sql = `
    UPDATE Invoice
    SET
      customer_id = ?,
      job_no = ?,
      sale_item_no = ?,
      total_cost = ?,
      payment_type = ?,
      date_paid = ?
    WHERE invoice_no = ?
  `;

  const params = [
    customer_id,
    job_no,
    sale_item_no,
    total_cost,
    payment_type,
    date_paid,
    req.params.id,
  ];

  db.run(sql, params, function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.json({ message: 'Invoice updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM Invoice WHERE invoice_no = ?';

  db.run(sql, [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.json({ message: 'Invoice deleted successfully' });
  });
});

module.exports = router;
