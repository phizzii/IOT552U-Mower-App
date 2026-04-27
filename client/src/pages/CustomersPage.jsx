import RoutePlaceholderPage from './RoutePlaceholderPage';

function CustomersPage() {
  return (
    <RoutePlaceholderPage
      endpoints={[
        { note: 'Drives the searchable customer list and detail pages.', route: 'GET /api/customers' },
        { note: 'Connect customer ownership to equipment records.', route: 'GET /api/machines' },
        { note: 'Lets the detail page show customer billing history and spend.', route: 'GET /api/invoices' },
      ]}
      eyebrow="Relationship Management"
      nextActions={[
        { copy: 'Build a searchable list page with calm, card-led detail affordances.', title: 'Design the customer index' },
        { copy: 'Use the detail screen to surface machines owned, jobs, and spend history.', title: 'Make the detail page useful' },
        { copy: 'Keep add/edit forms split into contact and address groupings.', title: 'Avoid spreadsheet-style forms' },
      ]}
      summary="Customers should feel like profiles, not rows in a database. This module will anchor contact details, ownership, history, and commercial value."
      tags={['Profiles', 'History', 'Spend tracking']}
      title="Customers"
    />
  );
}

export default CustomersPage;
