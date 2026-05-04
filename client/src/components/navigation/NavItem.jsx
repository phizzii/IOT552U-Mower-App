import { NavLink } from 'react-router-dom';

function NavItem({ item, onClick, revealRef }) {
  return (
    <NavLink
      className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
      data-reveal="nav-item"
      onClick={onClick}
      ref={revealRef}
      to={item.to}
    >
      <span className="nav-item-copy">
        <span className="nav-item-title">{item.label}</span>
        <span className="nav-item-description">{item.description}</span>
      </span>
      <span className="nav-item-tag" aria-hidden="true">
        {item.shortLabel}
      </span>
    </NavLink>
  );
}

export default NavItem;
