function ModuleActionCard({ actionLabel, onAction, sectionLabel, title }) {
  return (
    <section className="surface-card hero-card" data-reveal="intro">
      <div>
        <div className="section-label">{sectionLabel}</div>
        <h3 className="section-title">{title}</h3>
      </div>

      <button className="primary-button" onClick={onAction} type="button">
        {actionLabel}
      </button>
    </section>
  );
}

export default ModuleActionCard;
