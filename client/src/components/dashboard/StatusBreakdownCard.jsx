import DashboardSection from './DashboardSection';

function StatusBreakdownCard({ items, topService }) {
  const maxCount = items.reduce((highest, item) => Math.max(highest, item.count), 0);

  return (
    <DashboardSection eyebrow="Workshop Load" title="Job status breakdown">
      <div className="dashboard-status-list">
        {items.map((item) => (
          <div className="dashboard-status-row" key={item.label}>
            <div className="dashboard-status-copy">
              <strong>{item.label}</strong>
              <span>{item.count} jobs</span>
            </div>
            <div className="dashboard-status-bar-wrap">
              <div
                className="dashboard-status-bar"
                style={{
                  width: maxCount > 0 ? `${(item.count / maxCount) * 100}%` : '0%',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-inline-note">
        <span className="dashboard-inline-label">Most used service</span>
        <strong>{topService || 'Not enough usage yet'}</strong>
      </div>
    </DashboardSection>
  );
}

export default StatusBreakdownCard;
