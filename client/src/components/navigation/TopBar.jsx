function TopBar({ activeItem, onOpenMenu }) {
  return (
    <header className="top-bar">
      <div className="top-bar-copy">
        <div className="top-bar-heading-row">
          <button className="menu-button" onClick={onOpenMenu} type="button">
            <span className="sr-only">Open menu</span>
            Menu
          </button>
          <div>
            <span className="top-bar-label">Workspace</span>
            <h2 className="top-bar-title">{activeItem.label}</h2>
          </div>
        </div>
      </div>

      <div className="top-bar-utilities">
        <span className="status-pill">Workshop Live</span>
      </div>
    </header>
  );
}

export default TopBar;
