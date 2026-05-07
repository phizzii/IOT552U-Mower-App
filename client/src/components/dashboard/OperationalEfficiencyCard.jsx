import DashboardSection from './DashboardSection';
import { formatCurrency } from '../../utils/formatters';

function OperationalEfficiencyCard({ labourMetrics, mechanicsPerformance, repairTime }) {
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

      {mechanicsPerformance.length > 0 ? (
        <div className="report-simple-list">
          {mechanicsPerformance.map((mechanic) => (
            <div className="report-simple-row" key={mechanic.mechanic}>
              <div className="report-simple-copy">
                <strong>{mechanic.mechanic}</strong>
                <span>{mechanic.totalJobs} total · {mechanic.completedJobs} completed</span>
              </div>
              <strong className="report-simple-value">{mechanic.completionRate}%</strong>
            </div>
          ))}
        </div>
      ) : (
        <div className="report-empty-state">No mechanic data available</div>
      )}
    </DashboardSection>
  );
}

export default OperationalEfficiencyCard;
