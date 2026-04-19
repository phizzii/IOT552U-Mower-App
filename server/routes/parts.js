const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const sql = 'SELECT * FROM Part ORDER BY part_id';

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM Part WHERE part_id = ?';

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Part not found' });
    }

    return res.json(row);
  });
});

router.post('/', (req, res) => {
  const {
    part_description,
    supplier_name,
    supplier_cost,
    retail_price,
  } = req.body;

  const sql = `
    INSERT INTO Part (
      part_description,
      supplier_name,
      supplier_cost,
      retail_price
    )
    VALUES (?, ?, ?, ?)
  `;

  const params = [
    part_description,
    supplier_name,
    supplier_cost,
    retail_price,
  ];

  db.run(sql, params, function onInsert(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(201).json({
      message: 'Part created successfully',
      part_id: this.lastID,
    });
  });
});

router.put('/:id', (req, res) => {
  const {
    part_description,
    supplier_name,
    supplier_cost,
    retail_price,
  } = req.body;

  const sql = `
    UPDATE Part
    SET
      part_description = ?,
      supplier_name = ?,
      supplier_cost = ?,
      retail_price = ?
    WHERE part_id = ?
  `;

  const params = [
    part_description,
    supplier_name,
    supplier_cost,
    retail_price,
    req.params.id,
  ];

  db.run(sql, params, function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }

    return res.json({ message: 'Part updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM Part WHERE part_id = ?';

  db.run(sql, [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }

    return res.json({ message: 'Part deleted successfully' });
  });
});

module.exports = router;
