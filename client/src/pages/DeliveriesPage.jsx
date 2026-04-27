import RoutePlaceholderPage from './RoutePlaceholderPage';

function DeliveriesPage() {
  return (
    <RoutePlaceholderPage
      endpoints={[
        { note: 'Supports delivery/collection records and route cost context.', route: 'GET /api/deliveries' },
        { note: 'Links each delivery back to invoice totals and payment type.', route: 'GET /api/invoices' },
        { note: 'Can later connect to maps and route planning overlays.', route: 'GET /api/deliveries + map integration' },
      ]}
      eyebrow="Logistics"
      nextActions={[
        { copy: 'Start with a calm list and status summary before adding map work.', title: 'Build the logistics list first' },
        { copy: 'Add the route-planning map once the billing and address story is stable.', title: 'Stage map complexity later' },
        { copy: 'This is a strong place for animejs path drawing once route visuals exist.', title: 'Reserve motion for route rendering' },
      ]}
      summary="Deliveries should feel operational, not decorative. This page will eventually hold route planning, but the first UI should make scheduled collections and cost logic easy to scan."
      tags={['Collections', 'Delivery cost', 'Route planning']}
      title="Deliveries & Logistics"
    />
  );
}

export default DeliveriesPage;
