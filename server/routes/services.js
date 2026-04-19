const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const sql = `
    SELECT
      s.*,
      mt.type_name AS machine_type_name
    FROM Service s
    LEFT JOIN Machine_Type mt ON s.machine_type_id = mt.machine_type_id
    ORDER BY s.service_id
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
      s.*,
      mt.type_name AS machine_type_name
    FROM Service s
    LEFT JOIN Machine_Type mt ON s.machine_type_id = mt.machine_type_id
    WHERE s.service_id = ?
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Service not found' });
    }

    return res.json(row);
  });
});

router.post('/', (req, res) => {
  const { machine_type_id, service_description, price } = req.body;

  if (!machine_type_id) {
    return res.status(400).json({ error: 'machine_type_id is required' });
  }

  const sql = `
    INSERT INTO Service (
      machine_type_id,
      service_description,
      price
    )
    VALUES (?, ?, ?)
  `;

  db.run(
    sql,
    [machine_type_id, service_description, price],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.status(201).json({
        message: 'Service created successfully',
        service_id: this.lastID,
      });
    }
  );
});

router.put('/:id', (req, res) => {
  const { machine_type_id, service_description, price } = req.body;

  if (!machine_type_id) {
    return res.status(400).json({ error: 'machine_type_id is required' });
  }

  const sql = `
    UPDATE Service
    SET
      machine_type_id = ?,
      service_description = ?,
      price = ?
    WHERE service_id = ?
  `;

  db.run(
    sql,
    [machine_type_id, service_description, price, req.params.id],
    function onUpdate(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }

      return res.json({ message: 'Service updated successfully' });
    }
  );
});

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM Service WHERE service_id = ?';

  db.run(sql, [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    return res.json({ message: 'Service deleted successfully' });
  });
});

module.exports = router;
