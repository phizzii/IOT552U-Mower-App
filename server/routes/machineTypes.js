const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const sql = 'SELECT * FROM Machine_Type ORDER BY machine_type_id';

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM Machine_Type WHERE machine_type_id = ?';

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Machine type not found' });
    }

    return res.json(row);
  });
});

router.post('/', (req, res) => {
  const { type_name } = req.body;

  if (!type_name) {
    return res.status(400).json({ error: 'type_name is required' });
  }

  const sql = 'INSERT INTO Machine_Type (type_name) VALUES (?)';

  db.run(sql, [type_name], function onInsert(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.status(201).json({
      message: 'Machine type created successfully',
      machine_type_id: this.lastID,
    });
  });
});

router.put('/:id', (req, res) => {
  const { type_name } = req.body;

  if (!type_name) {
    return res.status(400).json({ error: 'type_name is required' });
  }

  const sql = `
    UPDATE Machine_Type
    SET type_name = ?
    WHERE machine_type_id = ?
  `;

  db.run(sql, [type_name, req.params.id], function onUpdate(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Machine type not found' });
    }

    return res.json({ message: 'Machine type updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM Machine_Type WHERE machine_type_id = ?';

  db.run(sql, [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Machine type not found' });
    }

    return res.json({ message: 'Machine type deleted successfully' });
  });
});

module.exports = router;
