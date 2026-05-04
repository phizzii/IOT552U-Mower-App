import DashboardSection from './DashboardSection';

function AlertsCard({ alerts }) {
  return (
    <DashboardSection eyebrow="Attention Queue" title="Signals worth acting on">
      <div className="dashboard-alert-list">
        {alerts.map((alert) => (
          <article className={`dashboard-alert tone-${alert.tone}`} key={alert.title}>
            <div className="dashboard-alert-header">
              <strong>{alert.title}</strong>
              <span>{alert.badge}</span>
            </div>
            <p>{alert.copy}</p>
          </article>
        ))}
      </div>
    </DashboardSection>
  );
}

export default AlertsCard;
