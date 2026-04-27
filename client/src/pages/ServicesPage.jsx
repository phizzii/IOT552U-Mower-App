import RoutePlaceholderPage from './RoutePlaceholderPage';

function ServicesPage() {
  return (
    <RoutePlaceholderPage
      endpoints={[
        { note: 'Provides the standard service catalogue and pricing records.', route: 'GET /api/services' },
        { note: 'Links pricing back to the machine type structure.', route: 'GET /api/machine-types' },
        { note: 'Feeds service/labour use inside active repair jobs.', route: 'GET /api/job-line-items' },
      ]}
      eyebrow="Pricing Structure"
      nextActions={[
        { copy: 'Build the service list first, then move to the pricing matrix for machine type crossovers.', title: 'Separate list from matrix work' },
        { copy: 'Reserve a grid-like layout for machine-type pricing rather than another long form.', title: 'Use a matrix UI later' },
        { copy: 'Keep the first version oriented around standard pricing clarity.', title: 'Prioritise readability over density' },
      ]}
      summary="Services and pricing need to feel structured and dependable because they influence both workshop operations and invoice trust."
      tags={['Service catalogue', 'Pricing', 'Machine-type links']}
      title="Services & Pricing"
    />
  );
}

export default ServicesPage;
