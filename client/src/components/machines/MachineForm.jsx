import { useEffect, useState } from 'react';

function createInitialState(machine) {
  return {
    customer_id: machine?.customer_id ? String(machine.customer_id) : '',
    machine_type_id: machine?.machine_type_id ? String(machine.machine_type_id) : '',
    make: machine?.make || '',
    model_no: machine?.model_no || '',
    serial_no: machine?.serial_no || '',
    other_no: machine?.other_no || '',
  };
}

function MachineForm({
  customers,
  error,
  isOpen,
  isSubmitting,
  machine,
  machineTypes,
  mode,
  onClose,
  onSubmit,
}) {
  const [formState, setFormState] = useState(createInitialState(machine));
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormState(createInitialState(machine));
    setValidationError('');
  }, [machine, isOpen]);

  if (!isOpen) {
    return null;
  }

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateForm() {
    if (!formState.customer_id) {
      return 'Please select a customer.';
    }

    if (!formState.machine_type_id) {
      return 'Please select a machine type.';
    }

    if (!formState.make.trim()) {
      return 'Make is required.';
    }

    if (!formState.model_no.trim()) {
      return 'Model number is required.';
    }

    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateForm();

    if (validation) {
      setValidationError(validation);
      return;
    }

    setValidationError('');
    await onSubmit(formState);
  }

  return (
    <div className="form-overlay" role="dialog" aria-modal="true">
      <button
        aria-label="Close machine form"
        className="form-backdrop"
        onClick={onClose}
        type="button"
      />

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-header">
          <div>
            <span className="section-label">Equipment</span>
            <h2 className="section-title">
              {mode === 'edit' ? 'Edit Machine' : 'Add Machine'}
            </h2>
          </div>

          <button className="secondary-button" onClick={onClose} type="button">
            Close
          </button>
        </div>

        {error || validationError ? (
          <div className="feedback-banner error">{error || validationError}</div>
        ) : null}

        <div className="form-body">
          <div className="form-section">
            <div className="section-label">Ownership & Type</div>

            <label className="field-group">
              <span className="field-label">Customer *</span>
              <select
                className="field-control"
                onChange={(e) => updateField('customer_id', e.target.value)}
                value={formState.customer_id}
              >
                <option value="">Select a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.customer_id} value={customer.customer_id}>
                    {customer.first_name} {customer.last_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span className="field-label">Machine Type *</span>
              <select
                className="field-control"
                onChange={(e) => updateField('machine_type_id', e.target.value)}
                value={formState.machine_type_id}
              >
                <option value="">Select machine type...</option>
                {machineTypes.map((type) => (
                  <option key={type.machine_type_id} value={type.machine_type_id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-section">
            <div className="section-label">Machine Details</div>

            <div className="field-row">
              <label className="field-group">
                <span className="field-label">Make *</span>
                <input
                  className="field-control"
                  onChange={(e) => updateField('make', e.target.value)}
                  placeholder="Honda"
                  type="text"
                  value={formState.make}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Model *</span>
                <input
                  className="field-control"
                  onChange={(e) => updateField('model_no', e.target.value)}
                  placeholder="HRX426"
                  type="text"
                  value={formState.model_no}
                />
              </label>
            </div>

            <label className="field-group">
              <span className="field-label">Serial Number</span>
              <input
                className="field-control"
                onChange={(e) => updateField('serial_no', e.target.value)}
                placeholder="HON-426-001"
                type="text"
                value={formState.serial_no}
              />
            </label>

            <label className="field-group">
              <span className="field-label">Other ID</span>
              <input
                className="field-control"
                onChange={(e) => updateField('other_no', e.target.value)}
                placeholder="Deck 42, Engine ABC123"
                type="text"
                value={formState.other_no}
              />
            </label>
          </div>
        </div>

        <div className="form-footer">
          <button
            className="primary-button"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? mode === 'edit'
                ? 'Saving...'
                : 'Creating...'
              : mode === 'edit'
              ? 'Save Machine'
              : 'Create Machine'}
          </button>
          <button
            className="secondary-button"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default MachineForm;
