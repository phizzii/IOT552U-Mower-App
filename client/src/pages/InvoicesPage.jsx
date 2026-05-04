import { startTransition, useEffect, useState } from 'react';
import PageHeader from '../components/navigation/PageHeader';
import InvoiceForm from '../components/invoices/InvoiceForm';
import InvoiceDetailPage from '../components/invoices/InvoiceDetailPage';
import InvoicesList from '../components/invoices/InvoicesList';
import { API_BASE_URL } from '../config';


async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error || payload.errors?.join(', ') || 'The request could not be completed.';
    throw new Error(message);
  }

  return payload;
}

function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [formState, setFormState] = useState({
    isOpen: false,
    mode: 'create',
    invoice: null,
    isSubmitting: false,
  });

  const [detailState, setDetailState] = useState({
    isOpen: false,
    invoiceId: null,
  });

  async function loadData() {
    setIsLoading(true);
    setError('');

    try {
      const [invoicesData, customersData, jobsData, saleItemsData] = await Promise.all([
        requestJson('/invoices'),
        requestJson('/customers'),
        requestJson('/repair-jobs'),
        requestJson('/sale-items'),
      ]);

      startTransition(() => {
        setInvoices(invoicesData);
        setCustomers(customersData);
        setJobs(jobsData);
        setSaleItems(saleItemsData);
      });
    } catch (loadError) {
      setError(loadError.message || 'Invoices could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleAddInvoice() {
    setFormState({ isOpen: true, mode: 'create', invoice: null, isSubmitting: false });
    setActionError('');
    setActionMessage('');
  }

  function handleEditInvoice(invoiceId) {
    const invoice = invoices.find((item) => item.invoice_no === invoiceId);
    if (!invoice) {
      setActionError('Invoice not found.');
      return;
    }
    setFormState({ isOpen: true, mode: 'edit', invoice, isSubmitting: false });
    setActionError('');
    setActionMessage('');
  }

  async function handleFormSubmit(formData) {
    setFormState((current) => ({ ...current, isSubmitting: true }));
    setActionError('');
    setActionMessage('');

    try {
      if (formState.mode === 'create') {
        await requestJson('/invoices', {
          body: JSON.stringify(formData),
          method: 'POST',
        });
        setActionMessage('Invoice created successfully.');
      } else {
        await requestJson(`/invoices/${formState.invoice.invoice_no}`, {
          body: JSON.stringify(formData),
          method: 'PUT',
        });
        setActionMessage('Invoice updated successfully.');
      }

      setFormState({ isOpen: false, mode: 'create', invoice: null, isSubmitting: false });
      await loadData();
    } catch (submitError) {
      setActionError(submitError.message || 'The request could not be completed.');
      setFormState((current) => ({ ...current, isSubmitting: false }));
    }
  }

  function handleFormClose() {
    setFormState({ isOpen: false, mode: 'create', invoice: null, isSubmitting: false });
    setActionError('');
  }

  async function handleDeleteInvoice(invoiceId) {
    setActionError('');
    setActionMessage('');

    try {
      await requestJson(`/invoices/${invoiceId}`, { method: 'DELETE' });
      setActionMessage('Invoice deleted successfully.');
      await loadData();
    } catch (deleteError) {
      setActionError(deleteError.message || 'Could not delete invoice.');
    }
  }

  function handleViewInvoice(invoiceId) {
    setDetailState({ isOpen: true, invoiceId });
  }

  function handleDetailClose() {
    setDetailState({ isOpen: false, invoiceId: null });
  }

  return (
    <div className="page-wrapper">
      <PageHeader
        eyebrow="Invoices & Payments"
        title="Invoices"
        summary="Invoices should communicate exactly what the customer is paying for without forcing users to reconstruct the story from separate repair and sales views."
      />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {actionError ? <div className="feedback-banner error">{actionError}</div> : null}
      {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}

      <div className="page-grid">
        <div className="page-stack">
          <section className="surface-card hero-card" data-reveal="intro">
            <div>
              <div className="section-label">Billing Workflow</div>
              <h3 className="section-title">Keep invoice records aligned with jobs and sales</h3>
              <p className="section-copy">
                Create, review, and manage invoices for repair jobs or direct sale items while tracking payment details.
              </p>
            </div>
            <button className="primary-button" onClick={handleAddInvoice} type="button">
              + New Invoice
            </button>
          </section>

          {isLoading ? (
            <div className="surface-card">
              <div className="loading-state">Loading invoices...</div>
            </div>
          ) : (
            <InvoicesList
              invoices={invoices}
              onDelete={handleDeleteInvoice}
              onEdit={handleEditInvoice}
              onView={handleViewInvoice}
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
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        saleItems={saleItems}
        invoice={formState.invoice}
      />

      {detailState.isOpen && (
        <InvoiceDetailPage
          invoiceId={detailState.invoiceId}
          onClose={handleDetailClose}
          onEdit={handleEditInvoice}
        />
      )}
    </div>
  );
}

export default InvoicesPage;
