const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const sql = `
    SELECT
      jp.*,
      p.part_description
    FROM Job_Part jp
    LEFT JOIN Part p ON jp.part_id = p.part_id
    ORDER BY jp.job_part_id
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
      jp.*,
      p.part_description
    FROM Job_Part jp
    LEFT JOIN Part p ON jp.part_id = p.part_id
    WHERE jp.job_part_id = ?
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Job part not found' });
    }

    return res.json(row);
  });
});

router.post('/', (req, res) => {
  const {
    job_no,
    part_id,
    quantity,
    bill_no,
    bill_date,
    charge_price,
  } = req.body;

  if (!job_no || !part_id || quantity === undefined) {
    return res.status(400).json({
      error: 'job_no, part_id and quantity are required',
    });
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

  const params = [
    job_no,
    part_id,
    quantity,
    bill_no,
    bill_date,
    charge_price,
  ];

  db.run(sql, params, function onInsert(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(201).json({
      message: 'Job part created successfully',
      job_part_id: this.lastID,
    });
  });
});

router.put('/:id', (req, res) => {
  const {
    job_no,
    part_id,
    quantity,
    bill_no,
    bill_date,
    charge_price,
  } = req.body;

  if (!job_no || !part_id || quantity === undefined) {
    return res.status(400).json({
      error: 'job_no, part_id and quantity are required',
    });
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

  const params = [
    job_no,
    part_id,
    quantity,
    bill_no,
    bill_date,
    charge_price,
    req.params.id,
  ];

  db.run(sql, params, function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Job part not found' });
    }

    return res.json({ message: 'Job part updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM Job_Part WHERE job_part_id = ?';

  db.run(sql, [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Job part not found' });
    }

    return res.json({ message: 'Job part deleted successfully' });
  });
});

module.exports = router;
