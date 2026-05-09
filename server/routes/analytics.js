const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { all, asyncHandler, getOne } = require('../utils/routeHelpers');
 
function parseLimit(value, fallback = 5) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
 
function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}
 
/**
* GET /api/analytics/job-status
* Returns count of jobs by status, with customer and machine context
*/
router.get(
  '/job-status',
  asyncHandler(async (req, res) => {
    const { status, machineTypeId } = req.query;
    const params = [];
    const where = [];
 
    if (hasValue(status)) {
      where.push('rj.status = ?');
      params.push(status);
    }
 
    if (hasValue(machineTypeId)) {
      where.push('m.machine_type_id = ?');
      params.push(Number(machineTypeId));
    }
 
    const sql = `
      SELECT
        rj.status,
        COUNT(*) AS job_count,
        COUNT(DISTINCT c.customer_id) AS customer_count,
        COUNT(DISTINCT m.machine_id) AS machine_count
      FROM Repair_Job rj
      JOIN Customer c ON rj.customer_id = c.customer_id
      JOIN Machine m ON rj.machine_id = m.machine_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      GROUP BY rj.status
      ORDER BY job_count DESC
    `;
 
    const rows = await all(db, sql, params);
 
    const statusCounts = rows.map((row) => {
      const label = row.status || 'Unspecified';
      const isComplete = label === 'Completed' || label === 'Collected';
 
      return {
        label,
        count: row.job_count,
        customerCount: row.customer_count,
        machineCount: row.machine_count,
        isComplete,
      };
    });
 
    const incompleteJobs = statusCounts.filter(
      (row) => !['Completed', 'Collected'].includes(row.label)
    );
 
    const incompleteCount = incompleteJobs.reduce(
      (sum, row) => sum + Number(row.count || 0),
      0
    );
 
    res.json({
      byStatus: statusCounts,
      incompleteJobs,
      totalIncomplete: incompleteCount,
    });
  })
);
 
/**
* GET /api/analytics/revenue
* Returns revenue over time and service breakdown
*/
router.get(
  '/revenue',
  asyncHandler(async (req, res) => {
    const { machineTypeId, limit } = req.query;
    const serviceLimit = parseLimit(limit, 5);
 
    const timeParams = [];
    const timeWhere = ['i.date_paid IS NOT NULL', `DATE(i.date_paid) >= DATE('now', '-30 days')`];
 
    if (hasValue(machineTypeId)) {
      timeWhere.push(`
        EXISTS (
          SELECT 1
          FROM Repair_Job rj
          JOIN Machine m ON rj.machine_id = m.machine_id
          WHERE rj.job_no = i.job_no
            AND m.machine_type_id = ?
        )
      `);
      timeParams.push(Number(machineTypeId));
    }
 
    const timeSql = `
      SELECT
        DATE(i.date_paid) AS date,
        ROUND(SUM(i.total_cost), 2) AS daily_revenue,
        COUNT(*) AS invoice_count
      FROM Invoice i
      LEFT JOIN Customer c ON i.customer_id = c.customer_id
      WHERE ${timeWhere.join(' AND ')}
      GROUP BY DATE(i.date_paid)
      ORDER BY date ASC
    `;
 
    const serviceParams = [];
    const serviceWhere = [];
 
    if (hasValue(machineTypeId)) {
      serviceWhere.push('s.machine_type_id = ?');
      serviceParams.push(Number(machineTypeId));
    }
 
    const serviceSql = `
      SELECT
        s.service_id,
        s.service_description,
        mt.type_name AS machine_type,
        COUNT(DISTINCT jli.job_id) AS job_count,
        ROUND(SUM(jli.line_total), 2) AS service_revenue
      FROM Job_Line_Item jli
      JOIN Service s ON jli.service_id = s.service_id
      LEFT JOIN Machine_Type mt ON s.machine_type_id = mt.machine_type_id
      ${serviceWhere.length ? `WHERE ${serviceWhere.join(' AND ')}` : ''}
      GROUP BY s.service_id, s.service_description, mt.type_name
      ORDER BY service_revenue DESC
      LIMIT ?
    `;
 
    const totalParams = [];
    const totalWhere = ['i.date_paid IS NOT NULL'];
 
    if (hasValue(machineTypeId)) {
      totalWhere.push(`
        EXISTS (
          SELECT 1
          FROM Repair_Job rj
          JOIN Machine m ON rj.machine_id = m.machine_id
          WHERE rj.job_no = i.job_no
            AND m.machine_type_id = ?
        )
      `);
      totalParams.push(Number(machineTypeId));
    }
 
    const totalSql = `
      SELECT ROUND(SUM(i.total_cost), 2) AS total
      FROM Invoice i
      LEFT JOIN Customer c ON i.customer_id = c.customer_id
      WHERE ${totalWhere.join(' AND ')}
    `;
 
    const timeRows = await all(db, timeSql, timeParams);
    const serviceRows = await all(db, serviceSql, [...serviceParams, serviceLimit]);
    const totalRow = await getOne(db, totalSql, totalParams);
 
    res.json({
      revenueOverTime: timeRows.map((row) => ({
        date: row.date,
        revenue: row.daily_revenue || 0,
        invoiceCount: row.invoice_count,
      })),
      serviceBreakdown: serviceRows.map((row) => ({
        service: row.service_description,
        machineType: row.machine_type,
        revenue: row.service_revenue || 0,
        jobCount: row.job_count,
      })),
      totalRevenue: totalRow?.total || 0,
    });
  })
);
 
/**
* GET /api/analytics/operational-efficiency
* Returns average repair time and labour metrics based on joined job/line-item data
*/
router.get(
  '/operational-efficiency',
  asyncHandler(async (req, res) => {
    const { status, machineTypeId, limit } = req.query;
    const rowLimit = parseLimit(limit, 10);
 
    const filters = [];
    const params = [];
 
    if (hasValue(status)) {
      filters.push('rj.status = ?');
      params.push(status);
    }
 
    if (hasValue(machineTypeId)) {
      filters.push('m.machine_type_id = ?');
      params.push(Number(machineTypeId));
    }
 
    const whereClause = `
      WHERE rj.date_logged IS NOT NULL
        AND rj.date_finished IS NOT NULL
        ${filters.length ? `AND ${filters.join(' AND ')}` : ''}
    `;
 
    const summarySql = `
      SELECT
        ROUND(AVG(job_stats.repair_days), 2) AS avg_repair_days,
        ROUND(AVG(job_stats.total_labour_hours), 2) AS avg_labour_hours_per_job,
        ROUND(AVG(job_stats.total_labour_cost), 2) AS avg_labour_cost_per_job,
        COUNT(*) AS completed_jobs
      FROM (
        SELECT
          rj.job_no,
          (julianday(rj.date_finished) - julianday(rj.date_logged)) AS repair_days,
          COALESCE(SUM(jli.labour_hours), 0) AS total_labour_hours,
          COALESCE(SUM(jli.line_total), 0) AS total_labour_cost
        FROM Repair_Job rj
        JOIN Machine m ON rj.machine_id = m.machine_id
        LEFT JOIN Job_Line_Item jli ON rj.job_no = jli.job_id
        ${whereClause}
        GROUP BY rj.job_no, rj.date_logged, rj.date_finished
      ) job_stats
    `;
 
    const totalJobsSql = `
      SELECT COUNT(*) AS total_jobs
      FROM Repair_Job rj
      JOIN Machine m ON rj.machine_id = m.machine_id
      ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
    `;
 
    const jobBreakdownSql = `
      SELECT
        rj.job_no,
        rj.status,
        rj.date_logged,
        rj.date_finished,
        mt.type_name AS machine_type,
        ROUND(julianday(rj.date_finished) - julianday(rj.date_logged), 2) AS repair_days,
        ROUND(COALESCE(SUM(jli.labour_hours), 0), 2) AS total_labour_hours,
        ROUND(COALESCE(SUM(jli.line_total), 0), 2) AS total_labour_cost
      FROM Repair_Job rj
      JOIN Machine m ON rj.machine_id = m.machine_id
      LEFT JOIN Machine_Type mt ON m.machine_type_id = mt.machine_type_id
      LEFT JOIN Job_Line_Item jli ON rj.job_no = jli.job_id
      ${whereClause}
      GROUP BY rj.job_no, rj.status, rj.date_logged, rj.date_finished, mt.type_name
      ORDER BY repair_days DESC
      LIMIT ?
    `;
 
    const summaryRow = await getOne(db, summarySql, params);
    const totalJobsRow = await getOne(db, totalJobsSql, params);
    const jobRows = await all(db, jobBreakdownSql, [...params, rowLimit]);
 
    res.json({
      repairTime: {
        avgDays: summaryRow?.avg_repair_days || 0,
        completedJobs: summaryRow?.completed_jobs || 0,
        totalJobs: totalJobsRow?.total_jobs || 0,
      },
      labourMetrics: {
        avgHours: summaryRow?.avg_labour_hours_per_job || 0,
        avgCost: summaryRow?.avg_labour_cost_per_job || 0,
      },
      jobBreakdown: jobRows.map((row) => ({
        jobNo: row.job_no,
        status: row.status,
        machineType: row.machine_type,
        dateLogged: row.date_logged,
        dateFinished: row.date_finished,
        repairDays: row.repair_days,
        labourHours: row.total_labour_hours,
        labourCost: row.total_labour_cost,
      })),
    });
  })
);
 
/**
* GET /api/analytics/logistics
* Returns delivery cost and distance analysis by customer area
*/
router.get(
  '/logistics',
  asyncHandler(async (req, res) => {
    const { machineTypeId, limit } = req.query;
    const rowLimit = parseLimit(limit, 10);
 
    const params = [];
    const where = [];
 
    if (hasValue(machineTypeId)) {
      where.push('m.machine_type_id = ?');
      params.push(Number(machineTypeId));
    }
 
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
 
    const metricsSql = `
      SELECT
        COUNT(d.delivery_id) AS total_deliveries,
        ROUND(AVG(d.miles_to_address), 2) AS avg_distance,
        ROUND(AVG(d.time_to_address), 2) AS avg_time_hours,
        ROUND(AVG(d.charge), 2) AS avg_charge,
        ROUND(SUM(d.charge), 2) AS total_charge,
        ROUND(SUM(d.miles_to_address), 2) AS total_distance
      FROM Delivery d
      JOIN Invoice i ON d.invoice_no = i.invoice_no
      LEFT JOIN Repair_Job rj ON i.job_no = rj.job_no
      LEFT JOIN Machine m ON rj.machine_id = m.machine_id
      ${whereClause}
    `;
 
    const costDistanceSql = `
      SELECT
        CAST(ROUND(d.miles_to_address) AS INTEGER) AS distance_bucket,
        COUNT(d.delivery_id) AS delivery_count,
        ROUND(AVG(d.charge), 2) AS avg_charge,
        ROUND(AVG(d.charge / NULLIF(d.miles_to_address, 0)), 2) AS cost_per_mile
      FROM Delivery d
      JOIN Invoice i ON d.invoice_no = i.invoice_no
      LEFT JOIN Repair_Job rj ON i.job_no = rj.job_no
      LEFT JOIN Machine m ON rj.machine_id = m.machine_id
      WHERE d.miles_to_address > 0
      ${where.length ? `AND ${where.join(' AND ')}` : ''}
      GROUP BY CAST(ROUND(d.miles_to_address) AS INTEGER)
      ORDER BY distance_bucket ASC
      LIMIT ?
    `;
 
    const metricsRow = await getOne(db, metricsSql, params);
    const costDistanceRows = await all(db, costDistanceSql, [...params, rowLimit]);
 
    res.json({
      summary: {
        totalDeliveries: metricsRow?.total_deliveries || 0,
        avgDistance: metricsRow?.avg_distance || 0,
        avgTimeHours: metricsRow?.avg_time_hours || 0,
        avgCharge: metricsRow?.avg_charge || 0,
        totalCharge: metricsRow?.total_charge || 0,
        totalDistance: metricsRow?.total_distance || 0,
      },
      costDistanceAnalysis: costDistanceRows.map((row) => ({
        distanceBucket: row.distance_bucket,
        deliveryCount: row.delivery_count,
        avgCharge: row.avg_charge,
        costPerMile: row.cost_per_mile,
      })),
    });
  })
);
 
/**
* GET /api/analytics/customer-lifetime-value
* Returns top customers by lifetime value, including job and machine engagement
*/
router.get(
  '/customer-lifetime-value',
  asyncHandler(async (req, res) => {
    const { machineTypeId, status, limit } = req.query;
    const rowLimit = parseLimit(limit, 5);
 
    const params = [];
    const where = [];
 
    if (hasValue(machineTypeId)) {
      where.push('m.machine_type_id = ?');
      params.push(Number(machineTypeId));
    }
 
    if (hasValue(status)) {
      where.push('rj.status = ?');
      params.push(status);
    }
 
    const sql = `
      SELECT
        c.customer_id,
        c.first_name,
        c.last_name,
        COUNT(DISTINCT m.machine_id) AS machine_count,
        COUNT(DISTINCT rj.job_no) AS job_count,
        COUNT(DISTINCT i.invoice_no) AS invoice_count,
        ROUND(COALESCE(SUM(i.total_cost), 0), 2) AS lifetime_value
      FROM Customer c
      LEFT JOIN Machine m ON c.customer_id = m.customer_id
      LEFT JOIN Repair_Job rj ON c.customer_id = rj.customer_id
      LEFT JOIN Invoice i ON c.customer_id = i.customer_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      GROUP BY c.customer_id, c.first_name, c.last_name
      HAVING lifetime_value > 0
      ORDER BY lifetime_value DESC
      LIMIT ?
    `;
 
    const rows = await all(db, sql, [...params, rowLimit]);
 
    res.json({
      topCustomers: rows.map((row) => ({
        customerId: row.customer_id,
        name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        lifetimeValue: row.lifetime_value,
        invoiceCount: row.invoice_count,
        jobCount: row.job_count,
        machineCount: row.machine_count,
      })),
    });
  })
);
 
module.exports = router;