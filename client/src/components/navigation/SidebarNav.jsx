import { useEffect, useMemo, useRef } from 'react';
import { animate, stagger } from 'animejs';
import NavItem from './NavItem';

function SidebarNav({ navigationItems }) {
  const navItemRefs = useRef([]);
  const titleRefs = useRef([]);

  const brandWords = useMemo(() => ['Workshop', 'Flow'], []);

  navItemRefs.current = [];
  titleRefs.current = [];

  useEffect(() => {
    if (titleRefs.current.length > 0) {
      animate(titleRefs.current, {
        delay: stagger(80),
        duration: 700,
        ease: 'out(3)',
        opacity: [0, 1],
        rotateZ: ['2deg', '0deg'],
        translateY: ['18px', '0px'],
      });
    }

    if (navItemRefs.current.length > 0) {
      animate(navItemRefs.current, {
        delay: stagger(45, { start: 220 }),
        duration: 540,
        ease: 'out(3)',
        opacity: [0, 1],
        translateY: ['-14px', '0px'],
      });
    }
  }, []);

  return (
    <aside className="sidebar-nav" aria-label="Primary navigation">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <div className="brand-seal">MW</div>
          <div className="brand-copy">
            <span className="brand-kicker">Mower Ops</span>
            <h1 className="brand-title">
              {brandWords.map((word, index) => (
                <span
                  key={word}
                  ref={(node) => {
                    if (node) {
                      titleRefs.current[index] = node;
                    }
                  }}
                >
                  {word}
                </span>
              ))}
            </h1>
          </div>
        </div>
        <p className="brand-note">
          Track intake, workshop progress, and billing from one operational hub
          designed around the way repair jobs actually move.
        </p>
      </div>

      <div className="nav-section">
        <div className="nav-section-label">Navigation</div>
        <nav className="nav-list">
          {navigationItems.map((item, index) => (
            <NavItem
              item={item}
              key={item.to}
              revealRef={(node) => {
                if (node) {
                  navItemRefs.current[index] = node;
                }
              }}
            />
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <span className="footer-label">Workshop Focus</span>
        <p className="footer-copy">
          Use the Jobs module as the core control point for intake, status changes,
          labour, parts usage, and invoice creation.
        </p>
      </div>
    </aside>
  );
}

export default SidebarNav;
