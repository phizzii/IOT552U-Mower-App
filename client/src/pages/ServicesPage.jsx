import { startTransition, useEffect, useState } from 'react';
import PageHeader from '../components/navigation/PageHeader';
import ServicesList from '../components/services/ServicesList';
import ServiceForm from '../components/services/ServiceForm';
import ServiceDetailPage from '../components/services/ServiceDetailPage';
import { fetchJson } from '../utils/api';

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [formState, setFormState] = useState({
    isOpen: false,
    mode: 'create',
    service: null,
    isSubmitting: false,
  });

  const [detailState, setDetailState] = useState({
    isOpen: false,
    serviceId: null,
  });

  async function loadData() {
    setIsLoading(true);
    setError('');

    try {
      const [servicesData, machineTypesData] = await Promise.all([
        fetchJson('/services'),
        fetchJson('/machine-types'),
      ]);

      startTransition(() => {
        setServices(servicesData);
        setMachineTypes(machineTypesData);
      });
    } catch (loadError) {
      setError(loadError.message || 'Services could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleAddService() {
    setFormState({ isOpen: true, mode: 'create', service: null, isSubmitting: false });
    setActionError('');
    setActionMessage('');
  }

  function handleEditService(serviceId) {
    const service = services.find((item) => item.service_id === serviceId);
    if (!service) {
      setActionError('Service not found.');
      return;
    }
    setFormState({ isOpen: true, mode: 'edit', service, isSubmitting: false });
    setActionError('');
    setActionMessage('');
  }

  async function handleFormSubmit(formData) {
    setFormState((current) => ({ ...current, isSubmitting: true }));
    setActionError('');
    setActionMessage('');

    try {
      if (formState.mode === 'create') {
        await fetchJson('/services', {
          body: JSON.stringify(formData),
          method: 'POST',
        });
        setActionMessage('Service created successfully.');
      } else {
        await fetchJson(`/services/${formState.service.service_id}`, {
          body: JSON.stringify(formData),
          method: 'PUT',
        });
        setActionMessage('Service updated successfully.');
      }
      setFormState({ isOpen: false, mode: 'create', service: null, isSubmitting: false });
      await loadData();
    } catch (submitError) {
      setActionError(submitError.message || 'The request could not be completed.');
      setFormState((current) => ({ ...current, isSubmitting: false }));
    }
  }

  function handleFormClose() {
    setFormState({ isOpen: false, mode: 'create', service: null, isSubmitting: false });
    setActionError('');
  }

  async function handleDeleteService(serviceId) {
    setActionError('');
    setActionMessage('');

    try {
      await fetchJson(`/services/${serviceId}`, { method: 'DELETE' });
      setActionMessage('Service deleted successfully.');
      await loadData();
    } catch (deleteError) {
      setActionError(deleteError.message || 'Could not delete service.');
    }
  }

  function handleViewService(serviceId) {
    setDetailState({ isOpen: true, serviceId });
  }

  function handleDetailClose() {
    setDetailState({ isOpen: false, serviceId: null });
  }

  return (
    <div className="page-wrapper">
      <PageHeader
        eyebrow="Services & Pricing"
        summary="Standard service pricing should be easy to manage, so your jobs stay consistent and margins stay visible."
        title="Services & Pricing"
      />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {actionError ? <div className="feedback-banner error">{actionError}</div> : null}
      {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}

      <div className="page-grid">
        <div className="page-stack">
          <section className="surface-card hero-card" data-reveal="intro">
            <div>
              <div className="section-label">Standard pricing</div>
              <h3 className="section-title">Maintain consistent service rates</h3>
              <p className="section-copy">
                Create standard labour and service lines for each machine type to keep job pricing accurate and repeatable.
              </p>
            </div>
            <button className="primary-button" onClick={handleAddService} type="button">
              + New Service
            </button>
          </section>

          {isLoading ? (
            <div className="surface-card">
              <div className="loading-state">Loading services...</div>
            </div>
          ) : (
            <ServicesList
              services={services}
              onDelete={handleDeleteService}
              onEdit={handleEditService}
              onView={handleViewService}
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
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        service={formState.service}
      />

      {detailState.isOpen && (
        <ServiceDetailPage
          serviceId={detailState.serviceId}
          onClose={handleDetailClose}
          onEdit={handleEditService}
        />
      )}
    </div>
  );
}

export default ServicesPage;
