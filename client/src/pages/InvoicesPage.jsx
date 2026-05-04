import { useCallback } from 'react';
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
      const [invoices, customers, jobs, saleItems] = await Promise.all([
        fetchJson('/invoices'),
        fetchJson('/customers'),
        fetchJson('/repair-jobs'),
        fetchJson('/sale-items'),
      ]);
      return { customers, invoices, jobs, saleItems };
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
  const jobs = data?.jobs || [];
  const saleItems = data?.saleItems || [];

  return (
    <div className="page-wrapper">
      <PageHeader eyebrow="Invoices & Payments" title="Invoices" />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {actionError ? <div className="feedback-banner error">{actionError}</div> : null}
      {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}

      <div className="page-grid">
        <div className="page-stack">
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
