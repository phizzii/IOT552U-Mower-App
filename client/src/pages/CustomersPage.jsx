import { useCallback } from 'react';
import CustomersList from '../components/customers/CustomersList';
import CustomerForm from '../components/customers/CustomerForm';
import CustomerDetailPage from '../components/customers/CustomerDetailPage';
import PageHeader from '../components/navigation/PageHeader';
import ModuleActionCard from '../components/shared/ModuleActionCard';
import useCrudPage from '../hooks/useCrudPage';
import { fetchJson } from '../utils/api';

function CustomersPage() {
  const loadCustomers = useCallback(async () => fetchJson('/customers'), []);

  const {
    actionError,
    actionMessage,
    closeDetail,
    closeForm,
    detailState,
    error,
    formState,
    isLoading,
    items: customers,
    openCreate,
    openDetail,
    openEdit,
    submitForm,
    deleteItem,
  } = useCrudPage({
    basePath: '/customers',
    getItems: (data) => data,
    itemIdKey: 'customer_id',
    itemLabel: 'Customer',
    loadData: loadCustomers,
    loadErrorMessage: 'Customers could not be loaded.',
  });

  return (
    <div className="page-wrapper">
      <PageHeader eyebrow="Relationship Management" title="Customers" />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {actionError ? <div className="feedback-banner error">{actionError}</div> : null}
      {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}

      <div className="page-grid">
        <div className="page-stack">
          <ModuleActionCard
            actionLabel="+ New Customer"
            onAction={openCreate}
            sectionLabel="Customers"
            title="Customer Records"
          />

          {isLoading ? (
            <div className="surface-card">
              <div className="loading-state">Loading customers...</div>
            </div>
          ) : (
            <CustomersList
              customers={customers}
              onDelete={deleteItem}
              onEdit={openEdit}
              onView={openDetail}
            />
          )}
        </div>
      </div>

      <CustomerForm
        customer={formState.item}
        error={actionError}
        isOpen={formState.isOpen}
        isSubmitting={formState.isSubmitting}
        mode={formState.mode}
        onClose={closeForm}
        onSubmit={submitForm}
      />

      {detailState.isOpen && (
        <CustomerDetailPage
          customerId={detailState.itemId}
          onClose={closeDetail}
          onEdit={openEdit}
        />
      )}
    </div>
  );
}

export default CustomersPage;
