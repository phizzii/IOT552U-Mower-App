import { useCallback, useMemo } from 'react';
import PageHeader from '../components/navigation/PageHeader';
import InvoiceForm from '../components/invoices/InvoiceForm';
import InvoiceDetailPage from '../components/invoices/InvoiceDetailPage';
import InvoicesList from '../components/invoices/InvoicesList';
import ModuleActionCard from '../components/shared/ModuleActionCard';
import useCrudPage from '../hooks/useCrudPage';
import { fetchJson } from '../utils/api';

function InvoicesPage() {
  const loadData = useCallback(
    async () => {
      const [invoices, customers, jobs, saleItems, jobParts, jobLineItems] = await Promise.all([
        fetchJson('/invoices'),
        fetchJson('/customers'),
        fetchJson('/repair-jobs'),
        fetchJson('/sale-items'),
        fetchJson('/job-parts'),
        fetchJson('/job-line-items'),
      ]);
      return { customers, invoices, jobLineItems, jobParts, jobs, saleItems };
    },
    []
  );

  const {
    actionError,
    actionMessage,
    closeDetail,
    closeForm,
    data,
    detailState,
    error,
    formState,
    isLoading,
    items: invoices,
    openCreate,
    openDetail,
    openEdit,
    submitForm,
    deleteItem,
  } = useCrudPage({
    basePath: '/invoices',
    getItems: (nextData) => nextData.invoices,
    itemIdKey: 'invoice_no',
    itemLabel: 'Invoice',
    loadData,
    loadErrorMessage: 'Invoices could not be loaded.',
  });

  const customers = data?.customers || [];
  const jobs = useMemo(() => {
    const jobsData = data?.jobs || [];
    const jobParts = data?.jobParts || [];
    const jobLineItems = data?.jobLineItems || [];

    return jobsData.map((job) => {
      const partsTotal = jobParts
        .filter((jobPart) => jobPart.job_no === job.job_no)
        .reduce(
          (sum, jobPart) =>
            sum + Number(jobPart.charge_price || 0) * Number(jobPart.quantity || 0),
          0
        );
      const servicesTotal = jobLineItems
        .filter((lineItem) => lineItem.job_id === job.job_no)
        .reduce((sum, lineItem) => sum + Number(lineItem.line_total || 0), 0);

      return {
        ...job,
        suggested_total: Number((partsTotal + servicesTotal).toFixed(2)),
      };
    });
  }, [data]);
  const saleItems = data?.saleItems || [];

  return (
    <div className="page-wrapper">
      <PageHeader eyebrow="Invoices & Payments" title="Invoices" />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {actionError ? <div className="feedback-banner error">{actionError}</div> : null}
      {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}

      <div className="page-stack page-stack--wide">
        <ModuleActionCard
          actionLabel="+ New Invoice"
          onAction={openCreate}
          sectionLabel="Billing"
          title="Invoice Records"
        />

        {isLoading ? (
          <div className="surface-card">
            <div className="loading-state">Loading invoices...</div>
          </div>
        ) : (
          <InvoicesList
            invoices={invoices}
            onDelete={deleteItem}
            onEdit={openEdit}
            onView={openDetail}
          />
        )}
      </div>

      <InvoiceForm
        customers={customers}
        error={actionError}
        isOpen={formState.isOpen}
        isSubmitting={formState.isSubmitting}
        jobs={jobs}
        mode={formState.mode}
        onClose={closeForm}
        onSubmit={submitForm}
        saleItems={saleItems}
        invoice={formState.item}
      />

      {detailState.isOpen && (
        <InvoiceDetailPage
          invoiceId={detailState.itemId}
          onClose={closeDetail}
          onEdit={openEdit}
        />
      )}
    </div>
  );
}

export default InvoicesPage;
