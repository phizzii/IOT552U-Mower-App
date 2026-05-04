const express = require('express');
const router = express.Router();
const db = require('../db/db');
const {
  all,
  asyncHandler,
  getOne,
  parseInteger,
  parseNumber,
  run,
  sendValidationErrors,
  validateIdParam,
} = require('../utils/routeHelpers');

function getDeliveryPayload(body) {
  const errors = [];

  return {
    charge: parseNumber(body.charge, 'charge', errors, { min: 0, required: true }),
    driver_cost_per_hour: parseNumber(
      body.driver_cost_per_hour,
      'driver_cost_per_hour',
      errors,
      { min: 0 }
    ),
    errors,
    fuel_price_per_litre: parseNumber(
      body.fuel_price_per_litre,
      'fuel_price_per_litre',
      errors,
      { min: 0 }
    ),
    invoice_no: parseInteger(body.invoice_no, 'invoice_no', errors, {
      min: 1,
      required: true,
    }),
    miles_to_address: parseNumber(body.miles_to_address, 'miles_to_address', errors, {
      min: 0,
    }),
    time_to_address: parseNumber(body.time_to_address, 'time_to_address', errors, {
      min: 0,
    }),
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const sql = `
      SELECT
        d.*,
        i.total_cost AS invoice_total_cost,
        i.payment_type AS invoice_payment_type
      FROM Delivery d
      LEFT JOIN Invoice i ON d.invoice_no = i.invoice_no
      ORDER BY d.delivery_id
    `;

    const rows = await all(db, sql);

    return res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'delivery_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = `
      SELECT
        d.*,
        i.total_cost AS invoice_total_cost,
        i.payment_type AS invoice_payment_type
      FROM Delivery d
      LEFT JOIN Invoice i ON d.invoice_no = i.invoice_no
      WHERE d.delivery_id = ?
    `;

    const row = await getOne(db, sql, [id]);

    if (!row) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    return res.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = getDeliveryPayload(req.body);

    if (sendValidationErrors(res, payload.errors)) {
      return;
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

    const result = await run(db, sql, [
      payload.invoice_no,
      payload.fuel_price_per_litre,
      payload.driver_cost_per_hour,
      payload.miles_to_address,
      payload.time_to_address,
      payload.charge,
    ]);

    return res.status(201).json({
      delivery_id: result.lastID,
      message: 'Delivery created successfully',
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const idValidation = validateIdParam(req.params.id, 'delivery_id');
    const payload = getDeliveryPayload(req.body);
    const errors = [...idValidation.errors, ...payload.errors];

    if (sendValidationErrors(res, errors)) {
      return;
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

    const result = await run(db, sql, [
      payload.invoice_no,
      payload.fuel_price_per_litre,
      payload.driver_cost_per_hour,
      payload.miles_to_address,
      payload.time_to_address,
      payload.charge,
      idValidation.id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    return res.json({ message: 'Delivery updated successfully' });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { errors, id } = validateIdParam(req.params.id, 'delivery_id');

    if (sendValidationErrors(res, errors)) {
      return;
    }

    const sql = 'DELETE FROM Delivery WHERE delivery_id = ?';
    const result = await run(db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    return res.json({ message: 'Delivery deleted successfully' });
  })
);

module.exports = router;
