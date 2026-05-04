import { startTransition, useEffect, useState } from 'react';
import CustomersList from '../components/customers/CustomersList';
import CustomerForm from '../components/customers/CustomerForm';
import CustomerDetailPage from '../components/customers/CustomerDetailPage';
import PageHeader from '../components/navigation/PageHeader';
import { fetchJson } from '../utils/api';

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Form state
  const [formState, setFormState] = useState({
    isOpen: false,
    mode: 'create',
    customer: null,
    isSubmitting: false,
  });

  // Detail view state
  const [detailState, setDetailState] = useState({
    isOpen: false,
    customerId: null,
  });

  // Load customers
  async function loadCustomers() {
    setIsLoading(true);
    setError('');

    try {
      const data = await fetchJson('/customers');
      startTransition(() => {
        setCustomers(data);
      });
    } catch (loadError) {
      setError(loadError.message || 'Customers could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  // Form handlers
  function handleAddCustomer() {
    setFormState({
      isOpen: true,
      mode: 'create',
      customer: null,
      isSubmitting: false,
    });
    setActionError('');
    setActionMessage('');
  }

  async function handleEditCustomer(customerId) {
    const customer = customers.find((c) => c.customer_id === customerId);

    if (!customer) {
      setActionError('Customer not found.');
      return;
    }

    setFormState({
      isOpen: true,
      mode: 'edit',
      customer,
      isSubmitting: false,
    });
    setActionError('');
    setActionMessage('');
  }

  async function handleFormSubmit(formData) {
    setFormState((current) => ({ ...current, isSubmitting: true }));
    setActionError('');
    setActionMessage('');

    try {
      if (formState.mode === 'create') {
        await fetchJson('/customers', {
          body: JSON.stringify(formData),
          method: 'POST',
        });

        setActionMessage('Customer created successfully.');
        setFormState({ isOpen: false, mode: 'create', customer: null, isSubmitting: false });
        await loadCustomers();
      } else {
        await fetchJson(`/customers/${formState.customer.customer_id}`, {
          body: JSON.stringify(formData),
          method: 'PUT',
        });

        setActionMessage('Customer updated successfully.');
        setFormState({ isOpen: false, mode: 'edit', customer: null, isSubmitting: false });
        await loadCustomers();
      }
    } catch (submitError) {
      setActionError(submitError.message || 'The request could not be completed.');
      setFormState((current) => ({ ...current, isSubmitting: false }));
    }
  }

  function handleFormClose() {
    setFormState({ isOpen: false, mode: 'create', customer: null, isSubmitting: false });
    setActionError('');
  }

  // Delete handler
  async function handleDeleteCustomer(customerId) {
    setActionError('');
    setActionMessage('');

    try {
      await fetchJson(`/customers/${customerId}`, {
        method: 'DELETE',
      });

      setActionMessage('Customer deleted successfully.');
      await loadCustomers();
    } catch (deleteError) {
      setActionError(deleteError.message || 'Could not delete customer.');
    }
  }

  // Detail view handlers
  function handleViewCustomer(customerId) {
    setDetailState({ isOpen: true, customerId });
  }

  function handleDetailClose() {
    setDetailState({ isOpen: false, customerId: null });
  }

  return (
    <div className="page-wrapper">
      <PageHeader
        eyebrow="Relationship Management"
        summary="Customers should feel like profiles, not rows in a database. This module will anchor contact details, ownership, history, and commercial value."
        title="Customers"
      />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {actionError ? <div className="feedback-banner error">{actionError}</div> : null}
      {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}

      <div className="page-grid">
        <div className="page-stack">
          <section className="surface-card hero-card" data-reveal="intro">
            <div>
              <div className="section-label">Quick Start</div>
              <h3 className="section-title">Build your customer base</h3>
              <p className="section-copy">
                Add customers here and link them to repair jobs, machines, and invoices.
                Each profile tracks ownership and billing history automatically.
              </p>
            </div>

            <button className="primary-button" onClick={handleAddCustomer} type="button">
              + New Customer
            </button>
          </section>

          {isLoading ? (
            <div className="surface-card">
              <div className="loading-state">Loading customers...</div>
            </div>
          ) : (
            <CustomersList
              customers={customers}
              onDelete={handleDeleteCustomer}
              onEdit={handleEditCustomer}
              onView={handleViewCustomer}
            />
          )}
        </div>
      </div>

      {/* Modal components */}
      <CustomerForm
        customer={formState.customer}
        error={actionError}
        isOpen={formState.isOpen}
        isSubmitting={formState.isSubmitting}
        mode={formState.mode}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      {detailState.isOpen && (
        <CustomerDetailPage
          customerId={detailState.customerId}
          onClose={handleDetailClose}
          onEdit={handleEditCustomer}
        />
      )}
    </div>
  );
}

export default CustomersPage;
