import { useCallback } from 'react';
import MachinesList from '../components/machines/MachinesList';
import MachineForm from '../components/machines/MachineForm';
import MachineDetailPage from '../components/machines/MachineDetailPage';
import PageHeader from '../components/navigation/PageHeader';
import ModuleActionCard from '../components/shared/ModuleActionCard';
import useCrudPage from '../hooks/useCrudPage';
import { fetchJson } from '../utils/api';

function MachinesPage() {
  const loadData = useCallback(
    async () => {
      const [customers, machineTypes, machines] = await Promise.all([
        fetchJson('/customers'),
        fetchJson('/machine-types'),
        fetchJson('/machines'),
      ]);
      return { customers, machineTypes, machines };
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
    items: machines,
    openCreate,
    openDetail,
    openEdit,
    submitForm,
    deleteItem,
  } = useCrudPage({
    basePath: '/machines',
    getItems: (nextData) => nextData.machines,
    itemIdKey: 'machine_id',
    itemLabel: 'Machine',
    loadData,
    loadErrorMessage: 'Machine data could not be loaded.',
  });

  const customers = data?.customers || [];
  const machineTypes = data?.machineTypes || [];

  return (
    <div className="page-wrapper">
      <PageHeader eyebrow="Equipment Tracking" title="Machines" />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {actionError ? <div className="feedback-banner error">{actionError}</div> : null}
      {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}

      <div className="page-grid">
        <div className="page-stack">
          <ModuleActionCard
            actionLabel="+ New Machine"
            onAction={openCreate}
            sectionLabel="Equipment"
            title="Machine Records"
          />

          {isLoading ? (
            <div className="surface-card">
              <div className="loading-state">Loading machines...</div>
            </div>
          ) : (
            <MachinesList
              customers={customers}
              machineTypes={machineTypes}
              machines={machines}
              onDelete={deleteItem}
              onEdit={openEdit}
              onView={openDetail}
            />
          )}
        </div>
      </div>

      <MachineForm
        customers={customers}
        error={actionError}
        isOpen={formState.isOpen}
        isSubmitting={formState.isSubmitting}
        machine={formState.item}
        machineTypes={machineTypes}
        mode={formState.mode}
        onClose={closeForm}
        onSubmit={submitForm}
      />

      {detailState.isOpen && (
        <MachineDetailPage
          machineId={detailState.itemId}
          onClose={closeDetail}
          onEdit={openEdit}
        />
      )}
    </div>
  );
}

export default MachinesPage;
