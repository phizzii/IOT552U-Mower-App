import RoutePlaceholderPage from './RoutePlaceholderPage';

function SettingsPage() {
  return (
    <RoutePlaceholderPage
      endpoints={[
        { note: 'Machine type management will likely anchor the first settings actions.', route: 'GET /api/machine-types' },
        { note: 'Service definitions may also be edited from an admin-focused flow.', route: 'GET /api/services' },
        { note: 'Future user/admin controls can live here without cluttering the workflow screens.', route: 'Future admin endpoints' },
      ]}
      eyebrow="Admin Surface"
      nextActions={[
        { copy: 'Keep this lightweight until the core workflow screens exist.', title: 'Do not overbuild settings early' },
        { copy: 'Place machine type and service configuration here once those editing flows are needed.', title: 'Use settings for configuration only' },
        { copy: 'Avoid moving operational tasks here that belong in jobs, billing, or logistics.', title: 'Protect the main workflow' },
      ]}
      summary="Settings should stay administrative and low-frequency. It’s useful, but it should never compete with the jobs workflow for attention."
      tags={['Configuration', 'Machine types', 'Admin']}
      title="Settings"
    />
  );
}

export default SettingsPage;
