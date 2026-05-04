const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { all, asyncHandler, getOne } = require('../utils/routeHelpers');

/**
 * GET /api/analytics/job-status
 * Returns count of jobs by status (with emphasis on incomplete jobs)
 */
router.get(
  '/job-status',
  asyncHandler(async (req, res) => {
    const sql = `
      SELECT
        status,
        COUNT(*) as count
      FROM Repair_Job
      GROUP BY status
      ORDER BY count DESC
    `;
    const rows = await all(db, sql);
    
    // Normalize status and separate incomplete jobs
    const statusCounts = rows.reduce((acc, row) => {
      const label = row.status || 'Unspecified';
      const isComplete = label === 'Completed' || label === 'Collected';
      acc.push({
        label,
        count: row.count,
        isComplete,
      });
      return acc;
    }, []);

    const incompleteJobs = rows.filter(
      (row) => !['Completed', 'Collected'].includes(row.status)
    );

    const incompleteCount = incompleteJobs.reduce((sum, row) => sum + row.count, 0);

    res.json({
      byStatus: statusCounts,
      incompleteJobs: incompleteJobs.map((row) => ({
        label: row.status || 'Unspecified',
        count: row.count,
      })),
      totalIncomplete: incompleteCount,
    });
  })
);

/**
 * GET /api/analytics/revenue
 * Returns revenue over time (by invoice date) and service breakdown
 */
router.get(
  '/revenue',
  asyncHandler(async (req, res) => {
    // Revenue over time (last 30 days, grouped by day)
    const timeSql = `
      SELECT
        DATE(date_paid) as date,
        SUM(total_cost) as daily_revenue,
        COUNT(*) as invoice_count
      FROM Invoice
      WHERE date_paid IS NOT NULL
        AND DATE(date_paid) >= DATE('now', '-30 days')
      GROUP BY DATE(date_paid)
      ORDER BY date ASC
    `;

    // Service breakdown (revenue by service)
    const serviceSql = `
      SELECT
        s.service_description,
        SUM(jli.line_total) as service_revenue,
        COUNT(DISTINCT jli.job_id) as job_count
      FROM Job_Line_Item jli
      JOIN Service s ON jli.service_id = s.service_id
      GROUP BY s.service_id, s.service_description
      ORDER BY service_revenue DESC
      LIMIT 10
    `;

    // Total revenue
    const totalSql = `
      SELECT SUM(total_cost) as total
      FROM Invoice
      WHERE date_paid IS NOT NULL
    `;

    const timeRows = await all(db, timeSql);
    const serviceRows = await all(db, serviceSql);
    const totalRow = await getOne(db, totalSql);

    res.json({
      revenueOverTime: timeRows.map((row) => ({
        date: row.date,
        revenue: row.daily_revenue || 0,
        invoiceCount: row.invoice_count,
      })),
      serviceBreakdown: serviceRows.map((row) => ({
        service: row.service_description,
        revenue: row.service_revenue || 0,
        jobCount: row.job_count,
      })),
      totalRevenue: totalRow?.total || 0,
    });
  })
);

/**
 * GET /api/analytics/operational-efficiency
 * Returns average repair time and jobs per mechanic
 */
router.get(
  '/operational-efficiency',
  asyncHandler(async (req, res) => {
    // Average repair time (from logged to finished)
    const repairTimeSql = `
      SELECT
        ROUND(AVG(
          CAST((julianday(date_finished) - julianday(date_logged)) AS FLOAT)
        ), 2) as avg_repair_days,
        CAST(COUNT(CASE WHEN date_finished IS NOT NULL THEN 1 END) AS FLOAT) as completed_jobs,
        COUNT(*) as total_jobs
      FROM Repair_Job
      WHERE date_finished IS NOT NULL AND date_logged IS NOT NULL
    `;

    // Jobs per mechanic
    const mechanicSql = `
      SELECT
        assigned_mechanic,
        COUNT(*) as job_count,
        COUNT(CASE WHEN status = 'Completed' OR status = 'Collected' THEN 1 END) as completed_count
      FROM Repair_Job
      WHERE assigned_mechanic IS NOT NULL AND TRIM(assigned_mechanic) != ''
      GROUP BY assigned_mechanic
      ORDER BY job_count DESC
    `;

    // Average labour hours per job
    const labourSql = `
      SELECT
        ROUND(AVG(labour_hours), 2) as avg_labour_hours,
        ROUND(AVG(line_total), 2) as avg_labour_cost
      FROM Job_Line_Item
      WHERE labour_hours IS NOT NULL
    `;

    const repairTimeRow = await getOne(db, repairTimeSql);
    const mechanicRows = await all(db, mechanicSql);
    const labourRow = await getOne(db, labourSql);

    res.json({
      repairTime: {
        avgDays: repairTimeRow?.avg_repair_days || 0,
        completedJobs: repairTimeRow?.completed_jobs || 0,
        totalJobs: repairTimeRow?.total_jobs || 0,
      },
      mechanicsPerformance: mechanicRows.map((row) => ({
        mechanic: row.assigned_mechanic,
        totalJobs: row.job_count,
        completedJobs: row.completed_count,
        completionRate: row.job_count > 0 ? ((row.completed_count / row.job_count) * 100).toFixed(1) : 0,
      })),
      labourMetrics: {
        avgHours: labourRow?.avg_labour_hours || 0,
        avgCost: labourRow?.avg_labour_cost || 0,
      },
    });
  })
);

/**
 * GET /api/analytics/logistics
 * Returns delivery cost and distance analysis
 */
router.get(
  '/logistics',
  asyncHandler(async (req, res) => {
    // Overall delivery metrics
    const metricsSql = `
      SELECT
        COUNT(*) as total_deliveries,
        ROUND(AVG(miles_to_address), 2) as avg_distance,
        ROUND(AVG(time_to_address), 2) as avg_time_hours,
        ROUND(AVG(charge), 2) as avg_charge,
        ROUND(SUM(charge), 2) as total_charge,
        ROUND(SUM(miles_to_address), 2) as total_distance
      FROM Delivery
    `;

    // Cost vs distance analysis
    const costDistanceSql = `
      SELECT
        ROUND(miles_to_address, -1) as distance_bucket,
        COUNT(*) as delivery_count,
        ROUND(AVG(charge), 2) as avg_charge,
        ROUND(AVG(charge / NULLIF(miles_to_address, 0)), 2) as cost_per_mile
      FROM Delivery
      WHERE miles_to_address > 0
      GROUP BY ROUND(miles_to_address, -1)
      ORDER BY distance_bucket ASC
    `;

    const metricsRow = await getOne(db, metricsSql);
    const costDistanceRows = await all(db, costDistanceSql);

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
 * Returns top customers by lifetime value
 */
router.get(
  '/customer-lifetime-value',
  asyncHandler(async (req, res) => {
    const sql = `
      SELECT
        c.customer_id,
        c.first_name,
        c.last_name,
        ROUND(SUM(i.total_cost), 2) as lifetime_value,
        COUNT(DISTINCT i.invoice_no) as invoice_count,
        COUNT(DISTINCT i.job_no) as job_count
      FROM Customer c
      LEFT JOIN Invoice i ON c.customer_id = i.customer_id
      GROUP BY c.customer_id, c.first_name, c.last_name
      HAVING lifetime_value > 0
      ORDER BY lifetime_value DESC
      LIMIT 15
    `;

    const rows = await all(db, sql);

    res.json({
      topCustomers: rows.map((row) => ({
        customerId: row.customer_id,
        name: `${row.first_name} ${row.last_name}`,
        lifetimeValue: row.lifetime_value,
        invoiceCount: row.invoice_count,
        jobCount: row.job_count,
      })),
    });
  })
);

module.exports = router;
