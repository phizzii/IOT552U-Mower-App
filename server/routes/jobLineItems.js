const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const sql = `
    SELECT
      jli.*,
      rj.job_no,
      s.service_description
    FROM Job_Line_Item jli
    LEFT JOIN Repair_Job rj ON jli.job_id = rj.job_no
    LEFT JOIN Service s ON jli.service_id = s.service_id
    ORDER BY jli.line_item_id
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
      jli.*,
      rj.job_no,
      s.service_description
    FROM Job_Line_Item jli
    LEFT JOIN Repair_Job rj ON jli.job_id = rj.job_no
    LEFT JOIN Service s ON jli.service_id = s.service_id
    WHERE jli.line_item_id = ?
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Job line item not found' });
    }

    return res.json(row);
  });
});

router.post('/', (req, res) => {
  const {
    job_id,
    service_id,
    description,
    labour_hours,
    hourly_rate,
    line_total,
  } = req.body;

  if (!job_id) {
    return res.status(400).json({ error: 'job_id is required' });
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

  const params = [
    job_id,
    service_id,
    description,
    labour_hours,
    hourly_rate,
    line_total,
  ];

  db.run(sql, params, function onInsert(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(201).json({
      message: 'Job line item created successfully',
      line_item_id: this.lastID,
    });
  });
});

router.put('/:id', (req, res) => {
  const {
    job_id,
    service_id,
    description,
    labour_hours,
    hourly_rate,
    line_total,
  } = req.body;

  if (!job_id) {
    return res.status(400).json({ error: 'job_id is required' });
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

  const params = [
    job_id,
    service_id,
    description,
    labour_hours,
    hourly_rate,
    line_total,
    req.params.id,
  ];

  db.run(sql, params, function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Job line item not found' });
    }

    return res.json({ message: 'Job line item updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM Job_Line_Item WHERE line_item_id = ?';

  db.run(sql, [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Job line item not found' });
    }

    return res.json({ message: 'Job line item deleted successfully' });
  });
});

module.exports = router;
