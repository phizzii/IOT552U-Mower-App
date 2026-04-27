function DashboardSection({ children, eyebrow, title }) {
  return (
    <section className="surface-card dashboard-section" data-reveal="section">
      <div className="section-label">{eyebrow}</div>
      <h3 className="section-title">{title}</h3>
      {children}
    </section>
  );
}

export default DashboardSection;
