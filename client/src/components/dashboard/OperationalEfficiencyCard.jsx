import { useMemo, useState } from 'react';
import DashboardSection from './DashboardSection';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
 
function OperationalEfficiencyCard({ labourMetrics, repairTime, jobBreakdown = [] }) {
  const [sortBy, setSortBy] = useState('repairDays');
 
  const sortedJobs = useMemo(() => {
    const jobs = [...jobBreakdown];
 
    return jobs.sort((left, right) => {
      if (sortBy === 'labourCost') {
        return Number(right.labourCost || 0) - Number(left.labourCost || 0);
      }
 
      if (sortBy === 'labourHours') {
        return Number(right.labourHours || 0) - Number(left.labourHours || 0);
      }
 
      return Number(right.repairDays || 0) - Number(left.repairDays || 0);
    });
  }, [jobBreakdown, sortBy]);
 
  return (
<DashboardSection eyebrow="Productivity" title="Operational Efficiency">
<div className="report-kpi-strip report-kpi-strip--two-up">
<div className="report-kpi-tile">
<span className="report-kpi-label">Average Repair Time</span>
<strong className="report-kpi-value">
            {repairTime.avgDays ? `${repairTime.avgDays} days` : '—'}
</strong>
<span className="report-kpi-meta">
            {repairTime.completedJobs} of {repairTime.totalJobs} completed
</span>
</div>
 
        <div className="report-kpi-tile">
<span className="report-kpi-label">Average Labour Cost</span>
<strong className="report-kpi-value">
            {labourMetrics.avgCost ? formatCurrency(labourMetrics.avgCost) : '—'}
</strong>
<span className="report-kpi-meta">
            {labourMetrics.avgHours || 0} hours per job
</span>
</div>
</div>
 
      <div className="report-chart-block">
<div className="report-chart-heading">
<strong>Completed job breakdown</strong>
<span>Compare turnaround time and labour effort across completed repairs</span>
</div>
 
        <div className="toggle-row">
<button
            className={`toggle-chip ${sortBy === 'repairDays' ? 'is-active' : ''}`}
            onClick={() => setSortBy('repairDays')}
            type="button"
>
            Sort by repair days
</button>
<button
            className={`toggle-chip ${sortBy === 'labourHours' ? 'is-active' : ''}`}
            onClick={() => setSortBy('labourHours')}
            type="button"
>
            Sort by labour hours
</button>
<button
            className={`toggle-chip ${sortBy === 'labourCost' ? 'is-active' : ''}`}
            onClick={() => setSortBy('labourCost')}
            type="button"
>
            Sort by labour cost
</button>
</div>
 
        {sortedJobs.length === 0 ? (
<div className="report-empty-state">No completed job data available</div>
        ) : (
<div className="report-table-wrap">
<table className="report-table">
<thead>
<tr>
<th>Job</th>
<th>Machine Type</th>
<th>Logged</th>
<th>Finished</th>
<th>Repair Days</th>
<th>Labour Hours</th>
<th>Labour Cost</th>
</tr>
</thead>
<tbody>
                {sortedJobs.map((job) => (
<tr key={job.jobNo}>
<td>#{job.jobNo}</td>
<td>{job.machineType || '—'}</td>
<td>{formatShortDate(job.dateLogged, '—')}</td>
<td>{formatShortDate(job.dateFinished, '—')}</td>
<td>{job.repairDays ?? '—'}</td>
<td>{job.labourHours ?? 0}</td>
<td>{formatCurrency(job.labourCost || 0)}</td>
</tr>
                ))}
</tbody>
</table>
</div>
        )}
</div>
</DashboardSection>
  );
}
 
export default OperationalEfficiencyCard;