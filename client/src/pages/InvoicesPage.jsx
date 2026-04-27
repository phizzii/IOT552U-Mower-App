import RoutePlaceholderPage from './RoutePlaceholderPage';

function InvoicesPage() {
  return (
    <RoutePlaceholderPage
      endpoints={[
        { note: 'Drives invoice listing, totals, and payment-state UI.', route: 'GET /api/invoices' },
        { note: 'Lets the invoice view reflect the related repair workflow.', route: 'GET /api/repair-jobs' },
        { note: 'Supports mixed invoices that include direct sale items too.', route: 'GET /api/sale-items' },
      ]}
      eyebrow="Billing Workflow"
      nextActions={[
        { copy: 'Start with invoice list + payment status before building the full printable detail layout.', title: 'Build the overview first' },
        { copy: 'Reflect the business rule that invoices can include a job, a sale item, or both.', title: 'Design for mixed billing' },
        { copy: 'Keep payment handling lightweight at first with clear status changes.', title: 'Stage payment interactions cleanly' },
      ]}
      summary="Invoices should communicate exactly what the customer is paying for without forcing users to reconstruct the story from separate repair and sales views."
      tags={['Billing', 'Payment status', 'Mixed invoice logic']}
      title="Invoices & Payments"
    />
  );
}

export default InvoicesPage;
