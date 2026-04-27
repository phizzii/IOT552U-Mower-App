import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MobileNav from '../navigation/MobileNav';
import SidebarNav from '../navigation/SidebarNav';
import TopBar from '../navigation/TopBar';
import PageTransition from '../motion/PageTransition';

function AppShell({ navigationItems }) {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const activeItem = useMemo(() => {
    const exactMatch = navigationItems.find((item) => item.to === location.pathname);

    if (exactMatch) {
      return exactMatch;
    }

    return navigationItems.find((item) => location.pathname.startsWith(item.to)) || navigationItems[0];
  }, [location.pathname, navigationItems]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('modal-open', isMobileNavOpen);

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isMobileNavOpen]);

  return (
    <div className="app-shell">
      <SidebarNav navigationItems={navigationItems} />
      <div className="shell-main">
        <TopBar
          activeItem={activeItem}
          onOpenMenu={() => setIsMobileNavOpen(true)}
        />
        <main className="shell-content">
          <PageTransition pathname={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <MobileNav
        isOpen={isMobileNavOpen}
        navigationItems={navigationItems}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </div>
  );
}

export default AppShell;
