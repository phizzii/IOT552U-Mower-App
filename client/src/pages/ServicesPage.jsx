import { useCallback } from 'react';
import PageHeader from '../components/navigation/PageHeader';
import ServicesList from '../components/services/ServicesList';
import ServiceForm from '../components/services/ServiceForm';
import ServiceDetailPage from '../components/services/ServiceDetailPage';
import ModuleActionCard from '../components/shared/ModuleActionCard';
import useCrudPage from '../hooks/useCrudPage';
import { fetchJson } from '../utils/api';

function ServicesPage() {
  const loadData = useCallback(
    async () => {
      const [services, machineTypes] = await Promise.all([
        fetchJson('/services'),
        fetchJson('/machine-types'),
      ]);
      return { machineTypes, services };
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
    items: services,
    openCreate,
    openDetail,
    openEdit,
    submitForm,
    deleteItem,
  } = useCrudPage({
    basePath: '/services',
    getItems: (nextData) => nextData.services,
    itemIdKey: 'service_id',
    itemLabel: 'Service',
    loadData,
    loadErrorMessage: 'Services could not be loaded.',
  });

  const machineTypes = data?.machineTypes || [];

  return (
    <div className="page-wrapper">
      <PageHeader eyebrow="Services & Pricing" title="Services & Pricing" />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {actionError ? <div className="feedback-banner error">{actionError}</div> : null}
      {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}

      <div className="page-grid">
        <div className="page-stack">
          <ModuleActionCard
            actionLabel="+ New Service"
            onAction={openCreate}
            sectionLabel="Services"
            title="Service Records"
          />

          {isLoading ? (
            <div className="surface-card">
              <div className="loading-state">Loading services...</div>
            </div>
          ) : (
            <ServicesList
              services={services}
              onDelete={deleteItem}
              onEdit={openEdit}
              onView={openDetail}
            />
          )}
        </div>
      </div>

      <ServiceForm
        error={actionError}
        isOpen={formState.isOpen}
        isSubmitting={formState.isSubmitting}
        machineTypes={machineTypes}
        mode={formState.mode}
        onClose={closeForm}
        onSubmit={submitForm}
        service={formState.item}
      />

      {detailState.isOpen && (
        <ServiceDetailPage
          serviceId={detailState.itemId}
          onClose={closeDetail}
          onEdit={openEdit}
        />
      )}
    </div>
  );
}

export default ServicesPage;
