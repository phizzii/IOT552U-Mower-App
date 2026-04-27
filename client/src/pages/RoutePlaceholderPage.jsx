import PageHeader from '../components/navigation/PageHeader';

function RoutePlaceholderPage({
  endpoints,
  eyebrow,
  nextActions,
  summary,
  tags,
  title,
}) {
  return (
    <div className="placeholder-page">
      <PageHeader eyebrow={eyebrow} summary={summary} title={title} />

      <div className="page-grid">
        <div className="page-stack">
          <section className="surface-card hero-card" data-reveal="metrics">
            <div>
              <div className="section-label">Build Focus</div>
              <h3 className="section-title">This screen is mapped, not overloaded.</h3>
              <p className="section-copy">
                The shell is here so your real design language can land cleanly in
                the next pass without mixing routing, layout, and content work.
              </p>
            </div>

            <div className="hero-metric-grid">
              <div className="metric-chip">
                <strong>{endpoints.length}</strong>
                <span>Connected endpoints to shape this module</span>
              </div>
              <div className="metric-chip">
                <strong>{nextActions.length}</strong>
                <span>High-value UI tasks queued after layout</span>
              </div>
              <div className="metric-chip">
                <strong>{tags.length}</strong>
                <span>Workflow signals defining this screen</span>
              </div>
            </div>

            <div className="tag-row">
              {tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="surface-card" data-reveal="endpoints">
            <div className="section-label">API Surface</div>
            <h3 className="section-title">Endpoints already shaping the UI</h3>
            <ul className="endpoint-list">
              {endpoints.map((endpoint) => (
                <li key={endpoint.route}>
                  <span className="list-bullet" aria-hidden="true" />
                  <div>
                    <div className="endpoint-title">{endpoint.route}</div>
                    <p className="endpoint-copy">{endpoint.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="page-stack">
          <section className="surface-card focus-panel" data-reveal="next-steps">
            <div>
              <div className="section-label">Next UI Moves</div>
              <h3 className="section-title">What to build once your components arrive</h3>
            </div>

            {nextActions.map((task, index) => (
              <div className="focus-row" key={task.title}>
                <div className="focus-step">0{index + 1}</div>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.copy}</span>
                </div>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default RoutePlaceholderPage;
