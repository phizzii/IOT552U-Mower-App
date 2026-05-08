import { useEffect, useMemo, useState } from 'react';

function createInitialState(invoice = null) {
  return {
    customer_id: invoice?.customer_id ? String(invoice.customer_id) : '',
    job_no: invoice?.job_no ? String(invoice.job_no) : '',
    total_cost: invoice?.total_cost != null ? String(invoice.total_cost) : '',
    payment_type: invoice?.payment_type || '',
    date_paid: invoice?.date_paid || '',
    sale_items:
      invoice?.sale_items?.length > 0
        ? invoice.sale_items.map((item) => ({
            quantity: String(item.quantity || 1),
            sale_item_no: String(item.sale_item_no),
          }))
        : invoice?.sale_item_no
          ? [{ quantity: '1', sale_item_no: String(invoice.sale_item_no) }]
          : [],
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

  const hasSaleItems = formData.sale_items.some((item) => item.sale_item_no);
  if (!formData.job_no && !hasSaleItems) {
    errors.reference = 'Choose a repair job or at least one sale item.';
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

  const selectedJob = useMemo(
    () => jobs.find((job) => String(job.job_no) === String(formData.job_no)) || null,
    [formData.job_no, jobs]
  );
  const selectedSaleItems = useMemo(
    () =>
      formData.sale_items
        .map((item) => {
          const saleItem = saleItems.find(
            (candidate) => String(candidate.sale_item_no) === String(item.sale_item_no)
          );

          if (!saleItem) {
            return null;
          }

          return {
            ...saleItem,
            quantity: Math.max(1, Number(item.quantity || 1)),
          };
        })
        .filter(Boolean),
    [formData.sale_items, saleItems]
  );
  const derivedTotal = useMemo(() => {
    const jobTotal = Number(selectedJob?.suggested_total || 0);
    const saleItemsTotal = selectedSaleItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * item.quantity,
      0
    );

    return Number((jobTotal + saleItemsTotal).toFixed(2));
  }, [selectedJob, selectedSaleItems]);
  const isTotalAutoCalculated = Boolean(formData.job_no || selectedSaleItems.length > 0);

  useEffect(() => {
    if (!isOpen || !isTotalAutoCalculated) {
      return;
    }

    setFormData((current) => ({
      ...current,
      total_cost: derivedTotal.toFixed(2),
    }));
  }, [derivedTotal, isOpen, isTotalAutoCalculated]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: '' }));
    }
    if (fieldErrors.reference && name === 'job_no') {
      setFieldErrors((current) => ({ ...current, reference: '' }));
    }
  }

  function handleJobChange(event) {
    const nextJobNo = event.target.value;
    const nextJob = jobs.find((job) => String(job.job_no) === String(nextJobNo));

    setFormData((current) => ({
      ...current,
      customer_id: nextJob?.customer_id ? String(nextJob.customer_id) : current.customer_id,
      job_no: nextJobNo,
    }));

    if (fieldErrors.reference) {
      setFieldErrors((current) => ({ ...current, reference: '' }));
    }
  }

  function handleSaleItemChange(index, field, value) {
    setFormData((current) => {
      const sale_items = current.sale_items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      );
      const selectedSaleItem = saleItems.find(
        (item) => String(item.sale_item_no) === String(sale_items[index]?.sale_item_no)
      );

      return {
        ...current,
        customer_id:
          !current.job_no && selectedSaleItem?.customer_id
            ? String(selectedSaleItem.customer_id)
            : current.customer_id,
        sale_items,
      };
    });

    if (fieldErrors.reference) {
      setFieldErrors((current) => ({ ...current, reference: '' }));
    }
  }

  function addSaleItemRow() {
    setFormData((current) => ({
      ...current,
      sale_items: [...current.sale_items, { quantity: '1', sale_item_no: '' }],
    }));
  }

  function removeSaleItemRow(index) {
    setFormData((current) => ({
      ...current,
      sale_items: current.sale_items.filter((_, itemIndex) => itemIndex !== index),
    }));
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
      total_cost: parseFloat(formData.total_cost),
      payment_type: formData.payment_type.trim(),
      date_paid: formData.date_paid || null,
      sale_item_no: null,
      sale_items: formData.sale_items
        .filter((item) => item.sale_item_no)
        .map((item) => ({
          quantity: parseInt(item.quantity, 10) || 1,
          sale_item_no: parseInt(item.sale_item_no, 10),
        })),
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
                onChange={handleJobChange}
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

            <div className="field-group">
              <span className="field-label">Sale items</span>
              <div className="invoice-sale-item-list">
                {formData.sale_items.length === 0 ? (
                  <div className="muted-copy">No sale items added yet.</div>
                ) : (
                  formData.sale_items.map((item, index) => (
                    <div className="invoice-sale-item-row" key={`${index}-${item.sale_item_no || 'new'}`}>
                      <select
                        className="field-control"
                        onChange={(event) =>
                          handleSaleItemChange(index, 'sale_item_no', event.target.value)
                        }
                        value={item.sale_item_no}
                      >
                        <option value="">Select sale item</option>
                        {saleItems.map((saleItem) => (
                          <option key={saleItem.sale_item_no} value={saleItem.sale_item_no}>
                            #{saleItem.sale_item_no} — {saleItem.details || saleItem.make || saleItem.model}
                          </option>
                        ))}
                      </select>
                      <input
                        className="field-control"
                        min="1"
                        onChange={(event) =>
                          handleSaleItemChange(index, 'quantity', event.target.value)
                        }
                        step="1"
                        type="number"
                        value={item.quantity}
                      />
                      <button
                        className="secondary-button"
                        onClick={() => removeSaleItemRow(index)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
                <button className="secondary-button" onClick={addSaleItemRow} type="button">
                  Add Sale Item
                </button>
              </div>
            </div>
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
                readOnly={isTotalAutoCalculated}
                step="0.01"
                type="number"
                value={formData.total_cost}
              />
              {fieldErrors.total_cost && <div className="field-error">{fieldErrors.total_cost}</div>}
              {isTotalAutoCalculated ? (
                <div className="field-helper">
                  Total is being calculated from the linked job and selected sale items.
                </div>
              ) : null}
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
