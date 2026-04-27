import DashboardSection from './DashboardSection';

function RecentActivityCard({ items }) {
  return (
    <DashboardSection eyebrow="Recent Activity" title="Latest operational movement">
      <div className="dashboard-activity-list">
        {items.map((item) => (
          <article className="dashboard-activity-item" key={`${item.kind}-${item.id}`}>
            <div className={`dashboard-activity-dot tone-${item.tone}`} />
            <div className="dashboard-activity-copy">
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <span className="dashboard-activity-date">{item.dateLabel}</span>
          </article>
        ))}
      </div>
    </DashboardSection>
  );
}

export default RecentActivityCard;
