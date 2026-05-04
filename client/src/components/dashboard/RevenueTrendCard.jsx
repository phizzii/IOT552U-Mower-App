import DashboardSection from './DashboardSection';

function RevenueTrendCard({ points, totalValue }) {
  const maxValue = points.reduce((highest, point) => Math.max(highest, point.value), 0);

  return (
    <DashboardSection eyebrow="Billing Snapshot" title="Recent invoice values">
      <div className="dashboard-trend">
        {points.map((point) => (
          <div className="dashboard-trend-item" key={point.label}>
            <div className="dashboard-trend-bar-wrap">
              <div
                className="dashboard-trend-bar"
                style={{
                  height: maxValue > 0 ? `${Math.max((point.value / maxValue) * 100, 8)}%` : '8%',
                }}
              />
            </div>
            <span className="dashboard-trend-label">{point.label}</span>
            <strong className="dashboard-trend-value">{point.formattedValue}</strong>
          </div>
        ))}
      </div>

      <div className="dashboard-inline-note">
        <span className="dashboard-inline-label">Total invoice value</span>
        <strong>{totalValue}</strong>
      </div>
    </DashboardSection>
  );
}

export default RevenueTrendCard;
