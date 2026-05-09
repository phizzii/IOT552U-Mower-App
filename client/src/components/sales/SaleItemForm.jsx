import { useEffect, useState } from 'react';

function createInitialState(saleItem = null) {
  return {
    customer_id: saleItem?.customer_id ? String(saleItem.customer_id) : '',
    date_sold: saleItem?.date_sold || new Date().toISOString().slice(0, 10),
    details: saleItem?.details || '',
    make: saleItem?.make || '',
    model: saleItem?.model || '',
    payment_type: saleItem?.payment_type || 'Card',
    price: saleItem?.price != null ? String(saleItem.price) : '',
    type: saleItem?.type || '',
  };
}

function SaleItemForm({
  customers,
  error,
  isOpen,
  isSubmitting,
  mode,
  onClose,
  onSubmit,
  saleItem,
}) {
  const [formData, setFormData] = useState(createInitialState);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData(createInitialState(saleItem));
    setValidationError('');
  }, [isOpen, saleItem]);

  if (!isOpen) {
    return null;
  }

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateForm() {
    if (!formData.customer_id) {
      return 'Please select a customer.';
    }

    if (!formData.type.trim()) {
      return 'Item type is required.';
    }

    if (!formData.details.trim()) {
      return 'Sale item details are required.';
    }

    if (!formData.price || Number(formData.price) < 0) {
      return 'Please enter a valid sale price.';
    }

    if (!formData.date_sold) {
      return 'Date sold is required.';
    }

    if (!formData.payment_type.trim()) {
      return 'Payment type is required.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationMessage = validateForm();

    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    setValidationError('');
    await onSubmit({
      customer_id: Number(formData.customer_id),
      date_sold: formData.date_sold,
      details: formData.details.trim(),
      make: formData.make.trim(),
      model: formData.model.trim(),
      payment_type: formData.payment_type.trim(),
      price: Number(formData.price),
      type: formData.type.trim(),
    });
  }

  return (
    <div className="form-overlay" role="dialog" aria-modal="true">
      <button aria-label="Close sale item form" className="form-backdrop" onClick={onClose} type="button" />

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-header">
          <div>
            <span className="section-label">Sales</span>
            <h2 className="section-title">
              {mode === 'edit' ? 'Edit Sale Item' : 'Add Sale Item'}
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
            <div className="section-label">Item Information</div>

            <label className="field-group">
              <span className="field-label">Customer *</span>
              <select
                className="field-control"
                onChange={(event) => updateField('customer_id', event.target.value)}
                value={formData.customer_id}
              >
                <option value="">Select customer...</option>
                {customers.map((customer) => (
                  <option key={customer.customer_id} value={customer.customer_id}>
                    {customer.first_name} {customer.last_name}
                  </option>
                ))}
              </select>
            </label>

            <div className="field-row">
              <label className="field-group">
                <span className="field-label">Type *</span>
                <input
                  className="field-control"
                  onChange={(event) => updateField('type', event.target.value)}
                  placeholder="Ride-on mower"
                  value={formData.type}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Date sold *</span>
                <input
                  className="field-control"
                  onChange={(event) => updateField('date_sold', event.target.value)}
                  type="date"
                  value={formData.date_sold}
                />
              </label>
            </div>

            <div className="field-row">
              <label className="field-group">
                <span className="field-label">Make</span>
                <input
                  className="field-control"
                  onChange={(event) => updateField('make', event.target.value)}
                  placeholder="Honda"
                  value={formData.make}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Model</span>
                <input
                  className="field-control"
                  onChange={(event) => updateField('model', event.target.value)}
                  placeholder="HF 2417"
                  value={formData.model}
                />
              </label>
            </div>

            <label className="field-group">
              <span className="field-label">Details *</span>
              <textarea
                className="field-control field-textarea"
                onChange={(event) => updateField('details', event.target.value)}
                placeholder="Describe the item sold, condition, and notes."
                value={formData.details}
              />
            </label>
          </div>

          <div className="form-section">
            <div className="section-label">Payment</div>

            <div className="field-row">
              <label className="field-group">
                <span className="field-label">Price *</span>
                <input
                  className="field-control"
                  min="0"
                  onChange={(event) => updateField('price', event.target.value)}
                  step="0.01"
                  type="number"
                  value={formData.price}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Payment type *</span>
                <input
                  className="field-control"
                  onChange={(event) => updateField('payment_type', event.target.value)}
                  placeholder="Card"
                  value={formData.payment_type}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="form-footer">
          <button className="secondary-button" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? 'Saving...'
              : mode === 'edit'
                ? 'Save Sale Item'
                : 'Create Sale Item'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SaleItemForm;
