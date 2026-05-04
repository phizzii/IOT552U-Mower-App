import { useEffect, useState } from 'react';

function createInitialState(customer) {
  return {
    address_line_1: customer?.address_line_1 || '',
    address_line_2: customer?.address_line_2 || '',
    address_line_3: customer?.address_line_3 || '',
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    phone_number: customer?.phone_number || '',
    postcode: customer?.postcode || '',
  };
}

function CustomerForm({
  customer,
  error,
  isOpen,
  isSubmitting,
  mode,
  onClose,
  onSubmit,
}) {
  const [formState, setFormState] = useState(createInitialState(customer));
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormState(createInitialState(customer));
    setValidationError('');
  }, [customer, isOpen]);

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
    if (!formState.first_name.trim()) {
      return 'First name is required.';
    }

    if (!formState.last_name.trim()) {
      return 'Last name is required.';
    }

    if (!formState.address_line_1.trim()) {
      return 'At least one address line is required.';
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
        aria-label="Close customer form"
        className="form-backdrop"
        onClick={onClose}
        type="button"
      />

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-header">
          <div>
            <span className="section-label">Customer Profile</span>
            <h2 className="section-title">
              {mode === 'edit' ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <p className="section-copy">
              Keep customer details split between contact info and address for clarity.
            </p>
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
            <div className="section-label">Contact Information</div>

            <div className="field-row">
              <label className="field-group">
                <span className="field-label">First Name *</span>
                <input
                  className="field-control"
                  onChange={(e) => updateField('first_name', e.target.value)}
                  placeholder="John"
                  type="text"
                  value={formState.first_name}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Last Name *</span>
                <input
                  className="field-control"
                  onChange={(e) => updateField('last_name', e.target.value)}
                  placeholder="Smith"
                  type="text"
                  value={formState.last_name}
                />
              </label>
            </div>

            <label className="field-group">
              <span className="field-label">Phone Number</span>
              <input
                className="field-control"
                onChange={(e) => updateField('phone_number', e.target.value)}
                placeholder="01632 960 123"
                type="tel"
                value={formState.phone_number}
              />
            </label>
          </div>

          <div className="form-section">
            <div className="section-label">Address Details</div>

            <label className="field-group">
              <span className="field-label">Address Line 1 *</span>
              <input
                className="field-control"
                onChange={(e) => updateField('address_line_1', e.target.value)}
                placeholder="123 Main Street"
                type="text"
                value={formState.address_line_1}
              />
            </label>

            <label className="field-group">
              <span className="field-label">Address Line 2</span>
              <input
                className="field-control"
                onChange={(e) => updateField('address_line_2', e.target.value)}
                placeholder="Apartment or suite"
                type="text"
                value={formState.address_line_2}
              />
            </label>

            <label className="field-group">
              <span className="field-label">Address Line 3</span>
              <input
                className="field-control"
                onChange={(e) => updateField('address_line_3', e.target.value)}
                placeholder="City or suburb"
                type="text"
                value={formState.address_line_3}
              />
            </label>

            <label className="field-group">
              <span className="field-label">Postcode</span>
              <input
                className="field-control"
                onChange={(e) => updateField('postcode', e.target.value)}
                placeholder="SW1A 2AA"
                type="text"
                value={formState.postcode}
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
              ? 'Save Customer'
              : 'Create Customer'}
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

export default CustomerForm;
