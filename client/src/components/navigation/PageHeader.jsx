function PageHeader({ eyebrow, summary, title }) {
  return (
    <header className="page-header" data-reveal="hero">
      <div className="page-header-copy">
        <span className="page-header-kicker">{eyebrow}</span>
        <h1 className="page-header-title">{title}</h1>
        {summary ? <p className="page-header-summary">{summary}</p> : null}
      </div>
    </header>
  );
}

export default PageHeader;
