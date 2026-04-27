import RoutePlaceholderPage from './RoutePlaceholderPage';

function MachinesPage() {
  return (
    <RoutePlaceholderPage
      endpoints={[
        { note: 'Provides the machine records shown in the machine list and detail screens.', route: 'GET /api/machines' },
        { note: 'Supplies machine categories and type metadata.', route: 'GET /api/machine-types' },
        { note: 'Lets each machine page show repair history over time.', route: 'GET /api/repair-jobs' },
      ]}
      eyebrow="Equipment Tracking"
      nextActions={[
        { copy: 'Start with a customer-linked machine list and machine type filter.', title: 'Build the overview table/card hybrid' },
        { copy: 'Let the detail page show owner, past jobs, and recurring issues.', title: 'Create a real machine profile' },
        { copy: 'Keep machine creation lightweight so it works inside the job intake flow too.', title: 'Design for reuse inside jobs' },
      ]}
      summary="Machines should bridge customer profiles and repair history, giving you a cleaner operational picture than jumping between separate records."
      tags={['Ownership', 'Machine type', 'Repair history']}
      title="Machines"
    />
  );
}

export default MachinesPage;
