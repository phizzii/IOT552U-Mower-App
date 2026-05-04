import { useCallback } from 'react';
import PartsList from '../components/parts/PartsList';
import PartForm from '../components/parts/PartForm';
import PartDetailPage from '../components/parts/PartDetailPage';
import PageHeader from '../components/navigation/PageHeader';
import ModuleActionCard from '../components/shared/ModuleActionCard';
import useCrudPage from '../hooks/useCrudPage';
import { fetchJson } from '../utils/api';

function PartsPage() {
  const loadData = useCallback(async () => fetchJson('/parts'), []);

  const {
    actionError,
    actionMessage,
    closeDetail,
    closeForm,
    detailState,
    error,
    formState,
    isLoading,
    items: parts,
    openCreate,
    openDetail,
    openEdit,
    submitForm,
    deleteItem,
  } = useCrudPage({
    basePath: '/parts',
    getItems: (data) => data,
    itemIdKey: 'part_id',
    itemLabel: 'Part',
    loadData,
    loadErrorMessage: 'Parts data could not be loaded.',
  });

  return (
    <div className="page-wrapper">
      <PageHeader eyebrow="Parts & Inventory" title="Parts" />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {actionError ? <div className="feedback-banner error">{actionError}</div> : null}
      {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}

      <div className="page-grid">
        <div className="page-stack">
          <ModuleActionCard
            actionLabel="+ New Part"
            onAction={openCreate}
            sectionLabel="Inventory"
            title="Part Records"
          />

          {isLoading ? (
            <div className="surface-card">
              <div className="loading-state">Loading parts...</div>
            </div>
          ) : (
            <PartsList
              onDelete={deleteItem}
              onEdit={openEdit}
              onView={openDetail}
              parts={parts}
            />
          )}
        </div>
      </div>

      <PartForm
        error={actionError}
        isOpen={formState.isOpen}
        isSubmitting={formState.isSubmitting}
        mode={formState.mode}
        onClose={closeForm}
        onSubmit={submitForm}
        part={formState.item}
      />

      {detailState.isOpen && (
        <PartDetailPage
          onClose={closeDetail}
          onEdit={openEdit}
          partId={detailState.itemId}
        />
      )}
    </div>
  );
}

export default PartsPage;
