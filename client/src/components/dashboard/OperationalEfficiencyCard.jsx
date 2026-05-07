import DashboardSection from './DashboardSection';
import { formatCurrency } from '../../utils/formatters';

function OperationalEfficiencyCard({ labourMetrics, repairTime }) {
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
    </DashboardSection>
  );
}

export default OperationalEfficiencyCard;
