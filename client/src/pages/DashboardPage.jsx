import { startTransition, useEffect, useState } from 'react';
import AlertsCard from '../components/dashboard/AlertsCard';
import DashboardKpiCard from '../components/dashboard/DashboardKpiCard';
import RecentActivityCard from '../components/dashboard/RecentActivityCard';
import RevenueTrendCard from '../components/dashboard/RevenueTrendCard';
import StatusBreakdownCard from '../components/dashboard/StatusBreakdownCard';
import PageHeader from '../components/navigation/PageHeader';
import { fetchJson } from '../utils/api';
import { formatCurrency, formatShortDate } from '../utils/formatters';

function normalizeStatus(status) {
  return status || 'Unspecified';
}

function buildDashboardModel({ deliveries, invoices, jobs, lineItems }) {
  const today = new Date().toISOString().slice(0, 10);
  const completedToday = jobs.filter(
    (job) => job.date_finished === today || job.date_collected === today
  ).length;
  const activeJobs = jobs.filter(
    (job) => !['Collected', 'Completed'].includes(normalizeStatus(job.status))
  ).length;
  const outstandingInvoices = invoices.filter((invoice) => !invoice.date_paid).length;
  const totalInvoiceValue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total_cost || 0),
    0
  );

  const statusMap = jobs.reduce((accumulator, job) => {
    const label = normalizeStatus(job.status);
    accumulator[label] = (accumulator[label] || 0) + 1;
    return accumulator;
  }, {});

  const statusItems = Object.entries(statusMap)
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count);

  const serviceUsage = lineItems.reduce((accumulator, item) => {
    const label = item.service_description || item.description || 'Custom labour';
    accumulator[label] = (accumulator[label] || 0) + 1;
    return accumulator;
  }, {});

  const topService = Object.entries(serviceUsage).sort((left, right) => right[1] - left[1])[0]?.[0];

  const revenuePoints = invoices.slice(-5).map((invoice) => ({
    formattedValue: formatCurrency(Number(invoice.total_cost || 0)),
    label: `INV ${invoice.invoice_no}`,
    value: Number(invoice.total_cost || 0),
  }));

  const recentJobs = jobs.map((job) => ({
    dateLabel: formatShortDate(job.date_logged || job.date_return),
    detail: `${job.customer_first_name || 'Customer'} ${job.customer_last_name || ''}`.trim(),
    id: job.job_no,
    kind: 'job',
    title: `Job #${job.job_no} · ${normalizeStatus(job.status)}`,
    tone: ['Collected', 'Completed'].includes(normalizeStatus(job.status))
      ? 'sage'
      : 'amber',
  }));

  const recentInvoices = invoices
    .filter((invoice) => invoice.date_paid)
    .map((invoice) => ({
      dateLabel: formatShortDate(invoice.date_paid),
      detail: `${invoice.customer_first_name || 'Customer'} ${invoice.customer_last_name || ''}`.trim(),
      id: invoice.invoice_no,
      kind: 'invoice',
      title: `Invoice #${invoice.invoice_no} paid · ${formatCurrency(Number(invoice.total_cost || 0))}`,
      tone: 'forest',
    }));

  const recentActivity = [...recentJobs, ...recentInvoices]
    .sort((left, right) => left.dateLabel.localeCompare(right.dateLabel))
    .reverse()
    .slice(0, 5);

  const overdueJobs = jobs.filter((job) => {
    if (!job.date_return) {
      return false;
    }

    return job.date_return < today && !['Collected', 'Completed'].includes(normalizeStatus(job.status));
  }).length;

  const deliveryCount = deliveries.length;

  return {
    alerts: [
      {
        badge: `${overdueJobs} overdue`,
        copy:
          overdueJobs > 0
            ? 'Some repair jobs have return dates in the past and still are not marked complete.'
            : 'No jobs are currently running past their planned return dates.',
        title: 'Overdue jobs',
        tone: overdueJobs > 0 ? 'danger' : 'sage',
      },
      {
        badge: `${outstandingInvoices} unpaid`,
        copy:
          outstandingInvoices > 0
            ? 'There are still invoice records with no payment date, so billing follow-up is needed.'
            : 'All current invoices are marked as paid.',
        title: 'Outstanding invoices',
        tone: outstandingInvoices > 0 ? 'amber' : 'sage',
      },
      {
        badge: `${deliveryCount} routes`,
        copy:
          deliveryCount > 0
            ? 'Delivery records are available for route and cost tracking.'
            : 'No delivery records are currently stored.',
        title: 'Delivery planning',
        tone: deliveryCount > 0 ? 'forest' : 'ink',
      },
    ],
    kpis: [
      {
        detail: 'Jobs still moving through the workshop flow.',
        label: 'Active Jobs',
        tone: 'forest',
        value: activeJobs,
      },
      {
        detail: 'Jobs finished or collected today.',
        label: 'Completed Today',
        tone: 'amber',
        value: completedToday,
      },
      {
        detail: 'Invoices still missing a payment date.',
        label: 'Outstanding Invoices',
        tone: 'ink',
        value: outstandingInvoices,
      },
      {
        detail: 'Total invoiced value across current records.',
        label: 'Invoice Value',
        tone: 'sage',
        value: formatCurrency(totalInvoiceValue),
      },
    ],
    recentActivity,
    revenuePoints,
    statusItems,
    topService,
    totalInvoiceValue: formatCurrency(totalInvoiceValue),
  };
}

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError('');

      try {
        const [jobs, invoices, deliveries, lineItems] = await Promise.all([
          fetchJson('/repair-jobs'),
          fetchJson('/invoices'),
          fetchJson('/deliveries'),
          fetchJson('/job-line-items'),
        ]);

        if (!isActive) {
          return;
        }

        const nextModel = buildDashboardModel({
          deliveries,
          invoices,
          jobs,
          lineItems,
        });

        startTransition(() => {
          setDashboardData(nextModel);
        });
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(loadError.message || 'Dashboard data could not be loaded.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="placeholder-page dashboard-page">
        <PageHeader eyebrow="Workshop Overview" title="Dashboard" />

        <div className="dashboard-kpi-grid">
          {['A', 'B', 'C', 'D'].map((item) => (
            <div className="surface-card dashboard-loading-card" key={item} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="placeholder-page dashboard-page">
        <PageHeader eyebrow="Workshop Overview" title="Dashboard" />

        <section className="surface-card dashboard-error-card" data-reveal="error">
          <div className="section-label">Connection Issue</div>
          <h3 className="section-title">Dashboard data is unavailable right now</h3>
          <p className="section-copy">
            {error || 'Start the backend on port 3001 and run `npm run seed` in the server folder, then refresh the frontend.'}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="placeholder-page dashboard-page">
      <PageHeader eyebrow="Workshop Overview" title="Dashboard" />

      <div className="dashboard-kpi-grid">
        {dashboardData.kpis.map((kpi) => (
          <DashboardKpiCard
            detail={kpi.detail}
            key={kpi.label}
            label={kpi.label}
            tone={kpi.tone}
            value={kpi.value}
          />
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="page-stack">
          <StatusBreakdownCard
            items={dashboardData.statusItems}
            topService={dashboardData.topService}
          />
          <RevenueTrendCard
            points={dashboardData.revenuePoints}
            totalValue={dashboardData.totalInvoiceValue}
          />
        </div>

        <div className="page-stack">
          <RecentActivityCard items={dashboardData.recentActivity} />
          <AlertsCard alerts={dashboardData.alerts} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
