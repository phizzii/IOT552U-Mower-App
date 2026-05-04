import { useEffect, useState } from 'react';

function createInitialState(invoice = null) {
  return {
    customer_id: invoice?.customer_id ? String(invoice.customer_id) : '',
    job_no: invoice?.job_no ? String(invoice.job_no) : '',
    sale_item_no: invoice?.sale_item_no ? String(invoice.sale_item_no) : '',
    total_cost: invoice?.total_cost != null ? String(invoice.total_cost) : '',
    payment_type: invoice?.payment_type || '',
    date_paid: invoice?.date_paid || '',
  };
}

function validateForm(formData) {
  const errors = {};

  if (!formData.customer_id) {
    errors.customer_id = 'Customer is required.';
  }

  const totalCost = parseFloat(formData.total_cost);
  if (!formData.total_cost || Number.isNaN(totalCost) || totalCost < 0) {
    errors.total_cost = 'Valid invoice total is required.';
  }

  if (!formData.payment_type.trim()) {
    errors.payment_type = 'Payment type is required.';
  }

  if (!formData.job_no && !formData.sale_item_no) {
    errors.reference = 'Choose a repair job or sale item reference.';
  }

  return errors;
}

function InvoiceForm({
  customers,
  error,
  isOpen,
  isSubmitting,
  jobs,
  mode,
  onClose,
  onSubmit,
  saleItems,
  invoice,
}) {
  const [formData, setFormData] = useState(createInitialState);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(createInitialState(invoice));
      setFieldErrors({});
    }
  }, [isOpen, invoice]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: '' }));
    }
    if (fieldErrors.reference && (name === 'job_no' || name === 'sale_item_no')) {
      setFieldErrors((current) => ({ ...current, reference: '' }));
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
      customer_id: parseInt(formData.customer_id, 10),
      job_no: formData.job_no ? parseInt(formData.job_no, 10) : null,
      sale_item_no: formData.sale_item_no ? parseInt(formData.sale_item_no, 10) : null,
      total_cost: parseFloat(formData.total_cost),
      payment_type: formData.payment_type.trim(),
      date_paid: formData.date_paid || null,
    });
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="form-overlay" role="dialog" aria-modal="true">
      <button aria-label="Close invoice form" className="form-backdrop" onClick={onClose} type="button" />

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-header">
          <div>
            <h3 className="form-title">
              {mode === 'create' ? 'Add Invoice' : 'Edit Invoice'}
            </h3>
            <p className="section-copy">
              Create billing records for jobs or direct sale items, and keep payments aligned with workshop activity.
            </p>
          </div>
          <button aria-label="Close form" className="close-button" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {error && <div className="feedback-banner error">{error}</div>}

        <div className="form-body">
          <div className="form-section">
            <div className="section-label">Invoice Reference</div>

            <label className="field-group">
              <span className="field-label">Customer *</span>
              <select
                className={`field-control ${fieldErrors.customer_id ? 'error' : ''}`}
                name="customer_id"
                onChange={handleInputChange}
                value={formData.customer_id}
              >
                <option value="">Select customer...</option>
                {customers.map((customer) => (
                  <option key={customer.customer_id} value={customer.customer_id}>
                    {customer.first_name} {customer.last_name}
                  </option>
                ))}
              </select>
              {fieldErrors.customer_id && <div className="field-error">{fieldErrors.customer_id}</div>}
            </label>

            <label className="field-group">
              <span className="field-label">Repair job</span>
              <select
                className="field-control"
                name="job_no"
                onChange={handleInputChange}
                value={formData.job_no}
              >
                <option value="">Select job (optional)</option>
                {jobs.map((job) => (
                  <option key={job.job_no} value={job.job_no}>
                    #{job.job_no} — {job.customer_first_name} {job.customer_last_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span className="field-label">Sale item</span>
              <select
                className="field-control"
                name="sale_item_no"
                onChange={handleInputChange}
                value={formData.sale_item_no}
              >
                <option value="">Select sale item (optional)</option>
                {saleItems.map((item) => (
                  <option key={item.sale_item_no} value={item.sale_item_no}>
                    #{item.sale_item_no} — {item.details || item.make || item.model}
                  </option>
                ))}
              </select>
            </label>
            {fieldErrors.reference && <div className="field-error">{fieldErrors.reference}</div>}
          </div>

          <div className="form-section">
            <div className="section-label">Payment</div>

            <label className="field-group">
              <span className="field-label">Total (£) *</span>
              <input
                className={`field-control ${fieldErrors.total_cost ? 'error' : ''}`}
                id="total_cost"
                name="total_cost"
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={formData.total_cost}
              />
              {fieldErrors.total_cost && <div className="field-error">{fieldErrors.total_cost}</div>}
            </label>

            <label className="field-group">
              <span className="field-label">Payment type *</span>
              <input
                className={`field-control ${fieldErrors.payment_type ? 'error' : ''}`}
                id="payment_type"
                name="payment_type"
                onChange={handleInputChange}
                placeholder="e.g. Card, Cash, Invoice"
                type="text"
                value={formData.payment_type}
              />
              {fieldErrors.payment_type && <div className="field-error">{fieldErrors.payment_type}</div>}
            </label>

            <label className="field-group">
              <span className="field-label">Date paid</span>
              <input
                className="field-control"
                id="date_paid"
                name="date_paid"
                onChange={handleInputChange}
                type="date"
                value={formData.date_paid}
              />
            </label>
          </div>
        </div>

        <div className="form-footer">
          <button className="secondary-button" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Invoice' : 'Update Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InvoiceForm;
