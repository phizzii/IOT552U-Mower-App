import DashboardSection from './DashboardSection';
import { formatCurrency } from '../../utils/formatters';

function OperationalEfficiencyCard({ repairTime, mechanicsPerformance, labourMetrics }) {
  return (
    <DashboardSection eyebrow="Productivity" title="Operational efficiency">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="dashboard-kpi-card tone-forest">
          <span className="dashboard-kpi-label">Avg repair time</span>
          <strong className="dashboard-kpi-value">
            {repairTime.avgDays ? `${repairTime.avgDays} days` : '—'}
          </strong>
          <p className="dashboard-kpi-detail">
            {repairTime.completedJobs} of {repairTime.totalJobs} completed
          </p>
        </div>

        <div className="dashboard-kpi-card tone-forest">
          <span className="dashboard-kpi-label">Avg labour cost</span>
          <strong className="dashboard-kpi-value">
            {labourMetrics.avgCost ? formatCurrency(labourMetrics.avgCost) : '—'}
          </strong>
          <p className="dashboard-kpi-detail">{labourMetrics.avgHours} hours per job</p>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--ink-soft)' }}>
          Mechanic performance
        </h4>
        <div className="dashboard-status-list">
          {mechanicsPerformance.map((mechanic) => (
            <div className="dashboard-status-row" key={mechanic.mechanic}>
              <div className="dashboard-status-copy">
                <strong>{mechanic.mechanic}</strong>
                <span>{mechanic.totalJobs} total • {mechanic.completedJobs} completed</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>
                  {mechanic.completionRate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {mechanicsPerformance.length === 0 && (
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>No mechanic data available</p>
      )}
    </DashboardSection>
  );
}

export default OperationalEfficiencyCard;
