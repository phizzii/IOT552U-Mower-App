function ExpandableRecord({
  actions,
  children,
  isOpen,
  onToggle,
  subtitle,
  summary,
  title,
}) {
  return (
    <article className={`record-card${isOpen ? ' is-open' : ''}`}>
      <div className="record-card-bar">
        <button
          aria-expanded={isOpen}
          className="record-card-toggle"
          onClick={onToggle}
          type="button"
        >
          <div className="record-card-copy">
            <strong className="record-card-title">{title}</strong>
            {subtitle ? <span className="record-card-subtitle">{subtitle}</span> : null}
          </div>

          {summary ? <span className="record-card-summary">{summary}</span> : null}

          <span className="record-card-chevron" aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
        </button>

        <div className="card-actions record-card-actions">{actions}</div>
      </div>

      {isOpen ? <div className="record-card-body">{children}</div> : null}
    </article>
  );
}

export default ExpandableRecord;
