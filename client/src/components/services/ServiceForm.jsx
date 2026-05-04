import { useEffect, useState } from 'react';

function createInitialState(service = null) {
  return {
    machine_type_id: service?.machine_type_id ? String(service.machine_type_id) : '',
    service_description: service?.service_description || '',
    price: service?.price != null ? String(service.price) : '',
  };
}

function validateForm(formData) {
  const errors = {};

  if (!formData.machine_type_id) {
    errors.machine_type_id = 'Machine type is required.';
  }

  if (!formData.service_description.trim()) {
    errors.service_description = 'Service description is required.';
  }

  const price = parseFloat(formData.price);
  if (!formData.price || isNaN(price) || price < 0) {
    errors.price = 'Valid price is required.';
  }

  return errors;
}

function ServiceForm({
  error,
  isOpen,
  isSubmitting,
  machineTypes,
  mode,
  onClose,
  onSubmit,
  service,
}) {
  const [formData, setFormData] = useState(createInitialState);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(createInitialState(service));
      setFieldErrors({});
    }
  }, [isOpen, service]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: '' }));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const errors = validateForm(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    onSubmit({
      machine_type_id: parseInt(formData.machine_type_id, 10),
      service_description: formData.service_description.trim(),
      price: parseFloat(formData.price),
    });
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="form-overlay" role="dialog" aria-modal="true">
      <button
        aria-label="Close service form"
        className="form-backdrop"
        onClick={onClose}
        type="button"
      />
      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-header">
          <div>
            <h3 className="form-title">
              {mode === 'create' ? 'Add Service' : 'Edit Service'}
            </h3>
            <p className="section-copy">
              Standardise pricing for each machine type and keep job quoting consistent.
            </p>
          </div>
          <button
            aria-label="Close form"
            className="close-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {error && <div className="feedback-banner error">{error}</div>}

        <div className="form-body">
          <div className="form-section">
            <div className="section-label">Service Details</div>
            <label className="field-group">
              <span className="field-label">Machine Type *</span>
              <select
                className={`field-control ${fieldErrors.machine_type_id ? 'error' : ''}`}
                name="machine_type_id"
                onChange={handleInputChange}
                value={formData.machine_type_id}
              >
                <option value="">Select machine type...</option>
                {machineTypes.map((type) => (
                  <option key={type.machine_type_id} value={type.machine_type_id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
              {fieldErrors.machine_type_id && (
                <div className="field-error">{fieldErrors.machine_type_id}</div>
              )}
            </label>

            <label className="field-group">
              <span className="field-label">Service Description *</span>
              <input
                className={`field-control ${fieldErrors.service_description ? 'error' : ''}`}
                id="service_description"
                name="service_description"
                onChange={handleInputChange}
                placeholder="e.g. Full service inspection"
                type="text"
                value={formData.service_description}
              />
              {fieldErrors.service_description && (
                <div className="field-error">{fieldErrors.service_description}</div>
              )}
            </label>
          </div>

          <div className="form-section">
            <div className="section-label">Pricing</div>
            <label className="field-group">
              <span className="field-label">Price (£) *</span>
              <input
                className={`field-control ${fieldErrors.price ? 'error' : ''}`}
                id="price"
                name="price"
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={formData.price}
              />
              {fieldErrors.price && (
                <div className="field-error">{fieldErrors.price}</div>
              )}
            </label>
          </div>
        </div>

        <div className="form-footer">
          <button className="secondary-button" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Service' : 'Update Service'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ServiceForm;
