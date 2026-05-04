import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import CustomersPage from './pages/CustomersPage';
import DashboardPage from './pages/DashboardPage';
import DeliveriesPage from './pages/DeliveriesPage';
import InvoicesPage from './pages/InvoicesPage';
import JobsPage from './pages/JobsPage';
import MachinesPage from './pages/MachinesPage';
import PartsPage from './pages/PartsPage';
import ReportsPage from './pages/ReportsPage';
import ServicesPage from './pages/ServicesPage';
import SettingsPage from './pages/SettingsPage';

const navigationItems = [
  { description: 'Live workshop overview', label: 'Dashboard', shortLabel: 'Home', to: '/dashboard' },
  { description: 'Repair workflow and status', label: 'Jobs', shortLabel: 'Jobs', to: '/jobs' },
  { description: 'Profiles and history', label: 'Customers', shortLabel: 'Cust', to: '/customers' },
  { description: 'Owned equipment and types', label: 'Machines', shortLabel: 'Mach', to: '/machines' },
  { description: 'Stock and supplier pricing', label: 'Parts', shortLabel: 'Parts', to: '/parts' },
  { description: 'Standard service pricing', label: 'Services', shortLabel: 'Serv', to: '/services' },
  { description: 'Billing and payment tracking', label: 'Invoices', shortLabel: 'Inv', to: '/invoices' },
  { description: 'Collections and deliveries', label: 'Deliveries', shortLabel: 'Del', to: '/deliveries' },
  { description: 'Visual insights and trends', label: 'Reports', shortLabel: 'Rpt', to: '/reports' },
  { description: 'Admin and configuration', label: 'Settings', shortLabel: 'Cfg', to: '/settings' },
];

function App() {
  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <Routes>
        <Route element={<AppShell navigationItems={navigationItems} />}>
          <Route index element={<Navigate replace to="dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="machines" element={<MachinesPage />} />
          <Route path="parts" element={<PartsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
