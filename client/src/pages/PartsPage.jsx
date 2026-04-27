import RoutePlaceholderPage from './RoutePlaceholderPage';

function PartsPage() {
  return (
    <RoutePlaceholderPage
      endpoints={[
        { note: 'Supplies the parts catalogue, pricing, and supplier references.', route: 'GET /api/parts' },
        { note: 'Shows which parts are actually consumed against jobs.', route: 'GET /api/job-parts' },
        { note: 'Lets stock and usage eventually feed operational reporting.', route: 'GET /api/reports (future)' },
      ]}
      eyebrow="Inventory Layer"
      nextActions={[
        { copy: 'Begin with the catalogue and cost/retail view before stock rules get more complex.', title: 'Build the core parts list' },
        { copy: 'Show job usage from the detail level rather than forcing users into cross-checking manually.', title: 'Link parts back to jobs' },
        { copy: 'Leave advanced stock alerts until after the list and job usage flows are settled.', title: 'Stage inventory depth later' },
      ]}
      summary="This module should support both the stock catalogue and the repair workflow, but the first version only needs to make parts searchable, understandable, and easy to attach to jobs."
      tags={['Inventory', 'Usage', 'Pricing']}
      title="Parts"
    />
  );
}

export default PartsPage;
