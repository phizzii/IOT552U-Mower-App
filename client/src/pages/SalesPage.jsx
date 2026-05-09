import { useCallback } from 'react';
import PageHeader from '../components/navigation/PageHeader';
import SaleItemDetailPage from '../components/sales/SaleItemDetailPage';
import SaleItemForm from '../components/sales/SaleItemForm';
import SalesList from '../components/sales/SalesList';
import ModuleActionCard from '../components/shared/ModuleActionCard';
import useCrudPage from '../hooks/useCrudPage';
import { fetchJson } from '../utils/api';

function SalesPage() {
  const loadData = useCallback(async () => {
    const [customers, saleItems] = await Promise.all([
      fetchJson('/customers'),
      fetchJson('/sale-items'),
    ]);

    return { customers, saleItems };
  }, []);

  const {
    actionError,
    actionMessage,
    closeDetail,
    closeForm,
    data,
    deleteItem,
    detailState,
    error,
    formState,
    isLoading,
    items: saleItems,
    openCreate,
    openDetail,
    openEdit,
    submitForm,
  } = useCrudPage({
    basePath: '/sale-items',
    getItems: (nextData) => nextData.saleItems,
    itemIdKey: 'sale_item_no',
    itemLabel: 'Sale item',
    loadData,
    loadErrorMessage: 'Sale items could not be loaded.',
  });

  const customers = data?.customers || [];

  return (
    <div className="page-wrapper">
      <PageHeader eyebrow="Sales & Stock" title="Sales" />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {actionError ? <div className="feedback-banner error">{actionError}</div> : null}
      {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}

      <div className="page-stack page-stack--wide">
        <ModuleActionCard
          actionLabel="+ New Sale Item"
          onAction={openCreate}
          sectionLabel="Sales"
          title="Sale Item Records"
        />

        {isLoading ? (
          <div className="surface-card">
            <div className="loading-state">Loading sale items...</div>
          </div>
        ) : (
          <SalesList
            onDelete={deleteItem}
            onEdit={openEdit}
            onView={openDetail}
            saleItems={saleItems}
          />
        )}
      </div>

      <SaleItemForm
        customers={customers}
        error={actionError}
        isOpen={formState.isOpen}
        isSubmitting={formState.isSubmitting}
        mode={formState.mode}
        onClose={closeForm}
        onSubmit={submitForm}
        saleItem={formState.item}
      />

      {detailState.isOpen ? (
        <SaleItemDetailPage
          onClose={closeDetail}
          onEdit={openEdit}
          saleItemId={detailState.itemId}
        />
      ) : null}
    </div>
  );
}

export default SalesPage;
