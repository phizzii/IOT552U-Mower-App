import DashboardSection from './DashboardSection';
import { formatCurrency, formatShortDate } from '../../utils/formatters';

function RevenueAnalysisCard({ revenueOverTime, serviceBreakdown, totalRevenue }) {
  const maxRevenue = revenueOverTime.reduce((highest, point) => Math.max(highest, point.revenue), 0);

  return (
    <DashboardSection eyebrow="Billing Snapshot" title="Revenue analysis">
      <p className="section-copy">
        Recent invoice values (last 30 days) and revenue breakdown by service type. This helps
        identify your most profitable service offerings.
      </p>

      <div>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--ink-soft)' }}>
          Revenue over time
        </h4>
        <div className="dashboard-trend">
          {revenueOverTime.length > 0 ? (
            revenueOverTime.map((point) => (
              <div className="dashboard-trend-item" key={point.date}>
                <div className="dashboard-trend-bar-wrap">
                  <div
                    className="dashboard-trend-bar"
                    style={{
                      height: maxRevenue > 0 ? `${Math.max((point.revenue / maxRevenue) * 100, 8)}%` : '8%',
                    }}
                  />
                </div>
                <span className="dashboard-trend-label">{formatShortDate(point.date)}</span>
                <strong className="dashboard-trend-value">{formatCurrency(point.revenue)}</strong>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>No revenue data available</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--ink-soft)' }}>
          Top services by revenue
        </h4>
        <div className="dashboard-status-list">
          {serviceBreakdown.slice(0, 5).map((service) => (
            <div className="dashboard-status-row" key={service.service}>
              <div className="dashboard-status-copy">
                <strong>{service.service}</strong>
                <span>{service.jobCount} jobs</span>
              </div>
              <div>
                <strong style={{ color: 'var(--highlight)' }}>{formatCurrency(service.revenue)}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-inline-note">
        <span className="dashboard-inline-label">Total revenue</span>
        <strong>{formatCurrency(totalRevenue)}</strong>
      </div>
    </DashboardSection>
  );
}

export default RevenueAnalysisCard;
