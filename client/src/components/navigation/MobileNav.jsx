import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import NavItem from './NavItem';

function MobileNav({ isOpen, navigationItems, onClose }) {
  const panelRef = useRef(null);
  const itemRefs = useRef([]);

  itemRefs.current = [];

  useEffect(() => {
    if (!isOpen || !panelRef.current) {
      return undefined;
    }

    animate(panelRef.current, {
      duration: 380,
      ease: 'out(3)',
      opacity: [0, 1],
      translateX: ['28px', '0px'],
    });

    if (itemRefs.current.length > 0) {
      animate(itemRefs.current, {
        delay: stagger(40, { start: 100 }),
        duration: 420,
        ease: 'out(3)',
        opacity: [0, 1],
        translateY: ['18px', '0px'],
      });
    }

    return undefined;
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        aria-label="Close mobile navigation"
        className="mobile-nav-backdrop"
        onClick={onClose}
        type="button"
      />
      <aside className="mobile-nav-panel" ref={panelRef}>
        <div className="mobile-nav-header">
          <div className="brand-copy">
            <span className="brand-kicker">Quick Navigation</span>
            <h2 className="brand-title">
              <span>Workshop</span>
              <span>Flow</span>
            </h2>
          </div>
          <button className="mobile-nav-close" onClick={onClose} type="button">
            <span className="sr-only">Close menu</span>
            x
          </button>
        </div>

        <div className="nav-list">
          {navigationItems.map((item, index) => (
            <NavItem
              item={item}
              key={item.to}
              onClick={onClose}
              revealRef={(node) => {
                if (node) {
                  itemRefs.current[index] = node;
                }
              }}
            />
          ))}
        </div>
      </aside>
    </>
  );
}

export default MobileNav;
