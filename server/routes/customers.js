const express = require('express');
const router = express.Router();
const db = require('../db/db');

// get all customers
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM Customer';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500),json({ error: err.message});
        }
        res.json(rows);
    });
});

// get single customer by ID
router.get('/:id', (req, res) => {
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message});
        }
        if (!row) {
            return res.status(404),json({ error: 'Customer not found'});
        }
        res.json(row);
    });
});

// post 