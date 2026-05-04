import { useEffect, useState } from 'react';
import JobStatusAnalysisCard from '../components/dashboard/JobStatusAnalysisCard';
import RevenueAnalysisCard from '../components/dashboard/RevenueAnalysisCard';
import OperationalEfficiencyCard from '../components/dashboard/OperationalEfficiencyCard';
import LogisticsAnalysisCard from '../components/dashboard/LogisticsAnalysisCard';
import CustomerValueCard from '../components/dashboard/CustomerValueCard';
import PageHeader from '../components/navigation/PageHeader';
import { API_BASE_URL } from '../config';

function ReportsPage() {
  const [jobStatus, setJobStatus] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [efficiency, setEfficiency] = useState(null);
  const [logistics, setLogistics] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true);
        const endpoints = [
          '/analytics/job-status',
          '/analytics/revenue',
          '/analytics/operational-efficiency',
          '/analytics/logistics',
          '/analytics/customer-lifetime-value',
        ];

        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(`${API_BASE_URL}${endpoint}`).then((res) => {
              if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
              return res.json();
            })
          )
        );

        setJobStatus(responses[0]);
        setRevenue(responses[1]);
        setEfficiency(responses[2]);
        setLogistics(responses[3]);
        setCustomers(responses[4]);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="placeholder-page">
        <PageHeader
          eyebrow="Insights"
          summary="Loading your operational analytics..."
          title="Reports & Visualisations"
        />
        <div className="dashboard-grid">
          {[1, 2, 3, 4].map((item) => (
            <div className="surface-card dashboard-loading-card" key={item} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="placeholder-page">
        <PageHeader
          eyebrow="Insights"
          summary="Data unavailable"
          title="Reports & Visualisations"
        />
        <section className="surface-card dashboard-error-card" data-reveal="error">
          <div className="section-label">Connection Issue</div>
          <h3 className="section-title">Analytics data could not be loaded</h3>
          <p className="section-copy">{error}</p>
        </section>
      </div>
    );
  }

  const totalJobs = jobStatus?.byStatus?.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <div className="placeholder-page">
      <PageHeader
        eyebrow="Insights"
        summary="Make data-driven decisions with real-time operational analytics"
        title="Reports & Visualisations"
      />

      <div className="dashboard-grid">
        <div className="page-stack">
          {/* Job Status Analysis */}
          {jobStatus && (
            <JobStatusAnalysisCard
              byStatus={jobStatus.byStatus}
              incompleteCount={jobStatus.totalIncomplete}
              totalJobs={totalJobs}
            />
          )}

          {/* Operational Efficiency */}
          {efficiency && (
            <OperationalEfficiencyCard
              repairTime={efficiency.repairTime}
              mechanicsPerformance={efficiency.mechanicsPerformance}
              labourMetrics={efficiency.labourMetrics}
            />
          )}
        </div>

        <div className="page-stack">
          {/* Revenue Analysis */}
          {revenue && (
            <RevenueAnalysisCard
              revenueOverTime={revenue.revenueOverTime}
              serviceBreakdown={revenue.serviceBreakdown}
              totalRevenue={revenue.totalRevenue}
            />
          )}

          {/* Logistics Analysis */}
          {logistics && (
            <LogisticsAnalysisCard
              summary={logistics.summary}
              costDistanceAnalysis={logistics.costDistanceAnalysis}
            />
          )}
        </div>
      </div>

      {/* Customer Lifetime Value - Full Width */}
      {customers && <CustomerValueCard topCustomers={customers.topCustomers} />}
    </div>
  );
}

export default ReportsPage;
