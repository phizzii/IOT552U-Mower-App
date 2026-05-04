import { useEffect, useState } from 'react';

function createInitialState(part = null) {
  return {
    part_description: part?.part_description || '',
    supplier_name: part?.supplier_name || '',
    supplier_cost: part?.supplier_cost || '',
    retail_price: part?.retail_price || '',
  };
}

function validateForm(formData) {
  const errors = {};

  if (!formData.part_description.trim()) {
    errors.part_description = 'Part description is required';
  }

  if (!formData.supplier_name.trim()) {
    errors.supplier_name = 'Supplier name is required';
  }

  const supplierCost = parseFloat(formData.supplier_cost);
  if (!formData.supplier_cost || isNaN(supplierCost) || supplierCost < 0) {
    errors.supplier_cost = 'Valid supplier cost is required';
  }

  const retailPrice = parseFloat(formData.retail_price);
  if (!formData.retail_price || isNaN(retailPrice) || retailPrice < 0) {
    errors.retail_price = 'Valid retail price is required';
  }

  if (retailPrice <= supplierCost) {
    errors.retail_price = 'Retail price must be higher than supplier cost';
  }

  return errors;
}

function PartForm({
  error,
  isOpen,
  isSubmitting,
  mode,
  onClose,
  onSubmit,
  part,
}) {
  const [formData, setFormData] = useState(createInitialState);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(createInitialState(part));
      setFieldErrors({});
    }
  }, [isOpen, part]);

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

    const submitData = {
      ...formData,
      supplier_cost: parseFloat(formData.supplier_cost),
      retail_price: parseFloat(formData.retail_price),
    };

    onSubmit(submitData);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="form-overlay" role="dialog" aria-modal="true">
      <button
        aria-label="Close part form"
        className="form-backdrop"
        onClick={onClose}
        type="button"
      />

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-header">
          <div>
            <h3 className="form-title">
              {mode === 'create' ? 'Add Part' : 'Edit Part'}
            </h3>
            <p className="section-copy">
              Track stock and pricing with a focused inventory card.
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
            <h4 className="form-section-title">Part Details</h4>

            <div className="form-group">
              <label className="form-label" htmlFor="part_description">
                Part Description *
              </label>
              <input
                className={`form-input ${fieldErrors.part_description ? 'error' : ''}`}
                id="part_description"
                name="part_description"
                onChange={handleInputChange}
                placeholder="e.g. Drive shaft assembly"
                type="text"
                value={formData.part_description}
              />
              {fieldErrors.part_description && (
                <div className="field-error">{fieldErrors.part_description}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="supplier_name">
                Supplier Name *
              </label>
              <input
                className={`form-input ${fieldErrors.supplier_name ? 'error' : ''}`}
                id="supplier_name"
                name="supplier_name"
                onChange={handleInputChange}
                placeholder="e.g. GreenField Parts Ltd"
                type="text"
                value={formData.supplier_name}
              />
              {fieldErrors.supplier_name && (
                <div className="field-error">{fieldErrors.supplier_name}</div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-section-title">Pricing</h4>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="supplier_cost">
                  Supplier Cost (£) *
                </label>
                <input
                  className={`form-input ${fieldErrors.supplier_cost ? 'error' : ''}`}
                  id="supplier_cost"
                  name="supplier_cost"
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={formData.supplier_cost}
                />
                {fieldErrors.supplier_cost && (
                  <div className="field-error">{fieldErrors.supplier_cost}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="retail_price">
                  Retail Price (£) *
                </label>
                <input
                  className={`form-input ${fieldErrors.retail_price ? 'error' : ''}`}
                  id="retail_price"
                  name="retail_price"
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={formData.retail_price}
                />
                {fieldErrors.retail_price && (
                  <div className="field-error">{fieldErrors.retail_price}</div>
                )}
              </div>
            </div>

            {formData.supplier_cost && formData.retail_price && (
              <div className="pricing-preview">
                <div className="preview-item">
                  <span className="preview-label">Margin:</span>
                  <span className="preview-value">
                    £{(parseFloat(formData.retail_price) - parseFloat(formData.supplier_cost)).toFixed(2)}
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Margin %:</span>
                  <span className="preview-value">
                    {(((parseFloat(formData.retail_price) - parseFloat(formData.supplier_cost)) / parseFloat(formData.supplier_cost)) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-footer">
          <button
            className="secondary-button"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="primary-button"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Add Part' : 'Update Part')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PartForm;
