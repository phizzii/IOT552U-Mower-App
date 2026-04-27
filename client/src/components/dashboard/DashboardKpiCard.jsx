function DashboardKpiCard({ detail, label, tone = 'forest', value }) {
  return (
    <article className={`dashboard-kpi-card tone-${tone}`} data-reveal="kpi">
      <span className="dashboard-kpi-label">{label}</span>
      <strong className="dashboard-kpi-value">{value}</strong>
      <p className="dashboard-kpi-detail">{detail}</p>
    </article>
  );
}

export default DashboardKpiCard;
