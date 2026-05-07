import { useEffect, useState } from 'react';
import JobStatusAnalysisCard from '../components/dashboard/JobStatusAnalysisCard';
import RevenueAnalysisCard from '../components/dashboard/RevenueAnalysisCard';
import OperationalEfficiencyCard from '../components/dashboard/OperationalEfficiencyCard';
import LogisticsAnalysisCard from '../components/dashboard/LogisticsAnalysisCard';
import CustomerValueCard from '../components/dashboard/CustomerValueCard';
import ReportFilterBar from '../components/dashboard/ReportFilterBar';
import ActiveFiltersSummary from '../components/dashboard/ActiveFiltersSummary';
import PageHeader from '../components/navigation/PageHeader';
import { fetchJson } from '../utils/api';
 
const initialFilters = {
  status: '',
  machineTypeId: '',
  limit: '5',
};
 
function ReportsPage() {
  const [jobStatus, setJobStatus] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [efficiency, setEfficiency] = useState(null);
  const [logistics, setLogistics] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [machineTypes, setMachineTypes] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true);
        setError(null);
 
        const params = {
          status: filters.status,
          machineTypeId: filters.machineTypeId,
          limit: filters.limit,
        };
 
        const [
          jobStatusResponse,
          revenueResponse,
          efficiencyResponse,
          logisticsResponse,
          customersResponse,
          machineTypesResponse,
        ] = await Promise.all([
          fetchJson('/analytics/job-status', { params }),
          fetchJson('/analytics/revenue', { params }),
          fetchJson('/analytics/operational-efficiency', { params }),
          fetchJson('/analytics/logistics', { params }),
          fetchJson('/analytics/customer-lifetime-value', { params }),
          fetchJson('/machine-types'),
        ]);
 
        setJobStatus(jobStatusResponse);
        setRevenue(revenueResponse);
        setEfficiency(efficiencyResponse);
        setLogistics(logisticsResponse);
        setCustomers(customersResponse);
        setMachineTypes(machineTypesResponse);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
 
    fetchAnalyticsData();
  }, [filters]);
 
  function handleFilterChange(field, value) {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }
 
  function handleResetFilters() {
    setFilters(initialFilters);
  }
 
  if (loading) {
    return (
<div className="placeholder-page">
<PageHeader eyebrow="Insights" title="Reports & Visualisations" />
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
<PageHeader eyebrow="Insights" title="Reports & Visualisations" />
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
<div className="placeholder-page reports-page">
<PageHeader
        eyebrow="Insights"
        title="Reports & Visualisations"
        summary="Use filters and comparative views below to explore workload, revenue, delivery performance, productivity, and customer value."
      />
 
      <ReportFilterBar
        filters={filters}
        machineTypes={machineTypes}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />
      
      <ActiveFiltersSummary filters={filters} machineTypes={machineTypes} />
 
      <div className="reports-layout">
<div className="reports-row reports-row--balanced">
          {jobStatus && (
<JobStatusAnalysisCard
              byStatus={jobStatus.byStatus}
              incompleteCount={jobStatus.totalIncomplete}
              totalJobs={totalJobs}
            />
          )}
 
          {revenue && (
<RevenueAnalysisCard
              revenueOverTime={revenue.revenueOverTime}
              serviceBreakdown={revenue.serviceBreakdown}
              totalRevenue={revenue.totalRevenue}
            />
          )}
</div>
 
        <div className="reports-row reports-row--balanced">
          {logistics && (
<LogisticsAnalysisCard
              summary={logistics.summary}
              costDistanceAnalysis={logistics.costDistanceAnalysis}
            />
          )}
 
          {efficiency && (
<OperationalEfficiencyCard
              repairTime={efficiency.repairTime}
              labourMetrics={efficiency.labourMetrics}
              jobBreakdown={efficiency.jobBreakdown || []}
            />
          )}
</div>
 
        {customers && (
<div className="reports-row reports-row--full">
<CustomerValueCard topCustomers={customers.topCustomers} />
</div>
        )}
</div>
</div>
  );
}
 
export default ReportsPage;