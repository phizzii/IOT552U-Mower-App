import RoutePlaceholderPage from './RoutePlaceholderPage';

function ReportsPage() {
  return (
    <RoutePlaceholderPage
      endpoints={[
        { note: 'Job data will drive status analysis and unfinished-work views.', route: 'GET /api/repair-jobs' },
        { note: 'Invoice data will drive revenue and customer value reporting.', route: 'GET /api/invoices' },
        { note: 'Delivery data will support logistics and cost visualisations.', route: 'GET /api/deliveries' },
      ]}
      eyebrow="Grading Opportunity"
      nextActions={[
        { copy: 'Prioritise job status, revenue, and repair-time insights before adding extra charts.', title: 'Focus on marks-driving visualisations' },
        { copy: 'Use your own component choices for charts rather than forcing a style too early.', title: 'Let the design system lead' },
        { copy: 'Keep this screen insight-led instead of becoming a dump of every dataset.', title: 'Curate the story' },
      ]}
      summary="Reports should prove decision-making value, not just show decorative charts. This area will matter a lot for grading once the workflow screens are solid."
      tags={['Insights', 'Revenue', 'Operational efficiency']}
      title="Reports & Visualisations"
    />
  );
}

export default ReportsPage;
