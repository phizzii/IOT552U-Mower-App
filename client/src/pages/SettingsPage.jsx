import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/navigation/PageHeader';
import { API_BASE_URL } from '../config';

const initialMachineTypeForm = {
  machine_type_id: null,
  type_name: '',
};

const initialServiceForm = {
  machine_type_id: '',
  price: '',
  service_description: '',
  service_id: null,
};

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
    throw new Error(payload.error || payload.errors?.join(', ') || 'Request failed');
  }

  return payload;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-GB', {
    currency: 'GBP',
    style: 'currency',
  }).format(Number(value || 0));
}

function SettingsPage() {
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [machineTypeForm, setMachineTypeForm] = useState(initialMachineTypeForm);
  const [machineTypes, setMachineTypes] = useState([]);
  const [selectedMachineTypeId, setSelectedMachineTypeId] = useState(null);
  const [serviceForm, setServiceForm] = useState(initialServiceForm);
  const [services, setServices] = useState([]);
  const [submitting, setSubmitting] = useState('');

  const loadSettingsData = useCallback(async (preferredMachineTypeId) => {
    setIsLoading(true);
    setError('');

    try {
      const [nextMachineTypes, nextServices] = await Promise.all([
        requestJson('/machine-types'),
        requestJson('/services'),
      ]);

      const fallbackMachineTypeId =
        preferredMachineTypeId ||
        selectedMachineTypeId ||
        nextMachineTypes[0]?.machine_type_id ||
        null;

      startTransition(() => {
        setMachineTypes(nextMachineTypes);
        setServices(nextServices);
        setSelectedMachineTypeId(fallbackMachineTypeId);
        setServiceForm((current) => ({
          ...current,
          machine_type_id:
            current.machine_type_id ||
            String(fallbackMachineTypeId || ''),
        }));
      });
    } catch (loadError) {
      setError(loadError.message || 'Settings data could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMachineTypeId]);

  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  const filteredServices = useMemo(() => {
    if (!selectedMachineTypeId) {
      return services;
    }

    return services.filter(
      (service) => service.machine_type_id === Number(selectedMachineTypeId)
    );
  }, [selectedMachineTypeId, services]);

  const selectedMachineType = useMemo(
    () =>
      machineTypes.find(
        (machineType) => machineType.machine_type_id === Number(selectedMachineTypeId)
      ) || null,
    [machineTypes, selectedMachineTypeId]
  );

  const serviceMetrics = useMemo(() => {
    const total = services.length;
    const averagePrice =
      total > 0
        ? services.reduce((sum, service) => sum + Number(service.price || 0), 0) / total
        : 0;

    return {
      averagePrice,
      total,
    };
  }, [services]);

  async function handleMachineTypeSubmit(event) {
    event.preventDefault();
    setSubmitting('machine-type');
    setError('');
    setFeedback('');

    try {
      if (machineTypeForm.machine_type_id) {
        await requestJson(`/machine-types/${machineTypeForm.machine_type_id}`, {
          body: JSON.stringify({ type_name: machineTypeForm.type_name }),
          method: 'PUT',
        });
        setFeedback('Machine type updated successfully.');
      } else {
        const result = await requestJson('/machine-types', {
          body: JSON.stringify({ type_name: machineTypeForm.type_name }),
          method: 'POST',
        });
        setFeedback('Machine type created successfully.');
        await loadSettingsData(result.machine_type_id);
      }

      if (machineTypeForm.machine_type_id) {
        await loadSettingsData(machineTypeForm.machine_type_id);
      }

      setMachineTypeForm(initialMachineTypeForm);
    } catch (submitError) {
      setError(submitError.message || 'Machine type could not be saved.');
    } finally {
      setSubmitting('');
    }
  }

  async function handleMachineTypeDelete(machineTypeId) {
    setSubmitting(`delete-machine-type-${machineTypeId}`);
    setError('');
    setFeedback('');

    try {
      await requestJson(`/machine-types/${machineTypeId}`, {
        method: 'DELETE',
      });
      setFeedback('Machine type deleted successfully.');
      setMachineTypeForm(initialMachineTypeForm);
      await loadSettingsData();
    } catch (deleteError) {
      setError(deleteError.message || 'Machine type could not be deleted.');
    } finally {
      setSubmitting('');
    }
  }

  async function handleServiceSubmit(event) {
    event.preventDefault();
    setSubmitting('service');
    setError('');
    setFeedback('');

    try {
      const payload = {
        machine_type_id: Number(serviceForm.machine_type_id),
        price: Number(serviceForm.price),
        service_description: serviceForm.service_description,
      };

      if (serviceForm.service_id) {
        await requestJson(`/services/${serviceForm.service_id}`, {
          body: JSON.stringify(payload),
          method: 'PUT',
        });
        setFeedback('Service updated successfully.');
      } else {
        await requestJson('/services', {
          body: JSON.stringify(payload),
          method: 'POST',
        });
        setFeedback('Service created successfully.');
      }

      await loadSettingsData(serviceForm.machine_type_id);
      setServiceForm((current) => ({
        ...initialServiceForm,
        machine_type_id: current.machine_type_id || '',
      }));
    } catch (submitError) {
      setError(submitError.message || 'Service could not be saved.');
    } finally {
      setSubmitting('');
    }
  }

  async function handleServiceDelete(serviceId) {
    setSubmitting(`delete-service-${serviceId}`);
    setError('');
    setFeedback('');

    try {
      await requestJson(`/services/${serviceId}`, {
        method: 'DELETE',
      });
      setFeedback('Service deleted successfully.');
      setServiceForm((current) =>
        current.service_id === serviceId
          ? {
              ...initialServiceForm,
              machine_type_id: current.machine_type_id || '',
            }
          : current
      );
      await loadSettingsData(selectedMachineTypeId);
    } catch (deleteError) {
      setError(deleteError.message || 'Service could not be deleted.');
    } finally {
      setSubmitting('');
    }
  }

  if (isLoading) {
    return (
      <div className="settings-page">
        <PageHeader
          eyebrow="Configuration"
          summary="Loading machine types and service definitions."
          title="Settings"
        />
        <section className="surface-card">
          <p className="section-copy">Loading settings workspace...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <PageHeader
        eyebrow="Configuration"
        summary="Manage machine categories and service pricing without pulling those low-frequency tasks into the main workshop workflow."
        title="Settings"
      />

      <section className="settings-metrics" data-reveal="settings-metrics">
        <div className="surface-card metric-chip">
          <strong>{machineTypes.length}</strong>
          <span>Machine types configured</span>
        </div>
        <div className="surface-card metric-chip">
          <strong>{serviceMetrics.total}</strong>
          <span>Service definitions live</span>
        </div>
        <div className="surface-card metric-chip">
          <strong>{formatCurrency(serviceMetrics.averagePrice)}</strong>
          <span>Average service price</span>
        </div>
      </section>

      {feedback ? (
        <section className="feedback-banner success" data-reveal="settings-feedback">
          {feedback}
        </section>
      ) : null}
      {error ? (
        <section className="feedback-banner error" data-reveal="settings-error">
          {error}
        </section>
      ) : null}

      <div className="settings-workspace">
        <section className="surface-card settings-card" data-reveal="settings-types">
          <div className="settings-card-header">
            <div>
              <span className="section-label">Machine Types</span>
              <h2 className="section-title jobs-panel-title">Equipment Categories</h2>
              <p className="section-copy">
                Use these as the parent definitions for workshop intake and service pricing.
              </p>
            </div>
          </div>

          <div className="settings-list">
            {machineTypes.map((machineType) => (
              <div
                className={`settings-list-row${
                  machineType.machine_type_id === Number(selectedMachineTypeId)
                    ? ' is-selected'
                    : ''
                }`}
                key={machineType.machine_type_id}
              >
                <button
                  className="settings-row-copy"
                  onClick={() => setSelectedMachineTypeId(machineType.machine_type_id)}
                  type="button"
                >
                  <strong>{machineType.type_name}</strong>
                  <span>
                    {
                      services.filter(
                        (service) =>
                          service.machine_type_id === machineType.machine_type_id
                      ).length
                    }{' '}
                    linked services
                  </span>
                </button>
                <div className="settings-row-actions">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      setMachineTypeForm({
                        machine_type_id: machineType.machine_type_id,
                        type_name: machineType.type_name,
                      })
                    }
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="secondary-button"
                    disabled={submitting === `delete-machine-type-${machineType.machine_type_id}`}
                    onClick={() => handleMachineTypeDelete(machineType.machine_type_id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form className="settings-form" onSubmit={handleMachineTypeSubmit}>
            <label className="field-group">
              <span className="field-label">Machine type name</span>
              <input
                className="field-control"
                onChange={(event) =>
                  setMachineTypeForm((current) => ({
                    ...current,
                    type_name: event.target.value,
                  }))
                }
                value={machineTypeForm.type_name}
              />
            </label>
            <div className="settings-form-actions">
              <button
                className="primary-button"
                disabled={submitting === 'machine-type'}
                type="submit"
              >
                {submitting === 'machine-type'
                  ? 'Saving...'
                  : machineTypeForm.machine_type_id
                    ? 'Update Type'
                    : 'Add Type'}
              </button>
              {machineTypeForm.machine_type_id ? (
                <button
                  className="secondary-button"
                  onClick={() => setMachineTypeForm(initialMachineTypeForm)}
                  type="button"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="surface-card settings-card" data-reveal="settings-services">
          <div className="settings-card-header">
            <div>
              <span className="section-label">Services</span>
              <h2 className="section-title jobs-panel-title">Pricing & Definitions</h2>
              <p className="section-copy">
                Build out the service catalogue that appears later in job line items and pricing flows.
              </p>
            </div>
            <div className="jobs-table-count">
              {selectedMachineType ? selectedMachineType.type_name : 'All machine types'}
            </div>
          </div>

          <label className="field-group">
            <span className="field-label">Filter by machine type</span>
            <select
              className="field-control"
              onChange={(event) => {
                setSelectedMachineTypeId(event.target.value || null);
                setServiceForm((current) => ({
                  ...current,
                  machine_type_id: event.target.value,
                }));
              }}
              value={selectedMachineTypeId || ''}
            >
              <option value="">All machine types</option>
              {machineTypes.map((machineType) => (
                <option
                  key={machineType.machine_type_id}
                  value={machineType.machine_type_id}
                >
                  {machineType.type_name}
                </option>
              ))}
            </select>
          </label>

          <div className="settings-list">
            {filteredServices.map((service) => (
              <div className="settings-list-row" key={service.service_id}>
                <button
                  className="settings-row-copy"
                  onClick={() =>
                    setServiceForm({
                      machine_type_id: String(service.machine_type_id),
                      price: String(service.price ?? ''),
                      service_description: service.service_description || '',
                      service_id: service.service_id,
                    })
                  }
                  type="button"
                >
                  <strong>{service.service_description || 'Untitled service'}</strong>
                  <span>
                    {service.machine_type_name || 'No machine type'} ·{' '}
                    {formatCurrency(service.price)}
                  </span>
                </button>
                <div className="settings-row-actions">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      setServiceForm({
                        machine_type_id: String(service.machine_type_id),
                        price: String(service.price ?? ''),
                        service_description: service.service_description || '',
                        service_id: service.service_id,
                      })
                    }
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="secondary-button"
                    disabled={submitting === `delete-service-${service.service_id}`}
                    onClick={() => handleServiceDelete(service.service_id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form className="settings-form settings-service-form" onSubmit={handleServiceSubmit}>
            <label className="field-group">
              <span className="field-label">Machine type</span>
              <select
                className="field-control"
                onChange={(event) =>
                  setServiceForm((current) => ({
                    ...current,
                    machine_type_id: event.target.value,
                  }))
                }
                value={serviceForm.machine_type_id}
              >
                <option value="">Select a machine type</option>
                {machineTypes.map((machineType) => (
                  <option
                    key={machineType.machine_type_id}
                    value={machineType.machine_type_id}
                  >
                    {machineType.type_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group field-span-2">
              <span className="field-label">Service description</span>
              <input
                className="field-control"
                onChange={(event) =>
                  setServiceForm((current) => ({
                    ...current,
                    service_description: event.target.value,
                  }))
                }
                value={serviceForm.service_description}
              />
            </label>
            <label className="field-group">
              <span className="field-label">Price</span>
              <input
                className="field-control"
                min="0"
                onChange={(event) =>
                  setServiceForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                step="0.01"
                type="number"
                value={serviceForm.price}
              />
            </label>
            <div className="settings-form-actions">
              <button
                className="primary-button"
                disabled={submitting === 'service'}
                type="submit"
              >
                {submitting === 'service'
                  ? 'Saving...'
                  : serviceForm.service_id
                    ? 'Update Service'
                    : 'Add Service'}
              </button>
              {serviceForm.service_id ? (
                <button
                  className="secondary-button"
                  onClick={() =>
                    setServiceForm({
                      ...initialServiceForm,
                      machine_type_id: String(selectedMachineTypeId || ''),
                    })
                  }
                  type="button"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
