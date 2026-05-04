import { useMemo } from 'react';

function PartsList({ onDelete, onEdit, onView, parts }) {
  const filteredParts = useMemo(() => {
    return parts;
  }, [parts]);

  return (
    <div className="parts-list-card surface-card">
      <div className="parts-list-header">
        <div>
          <h3 className="section-title">Parts Inventory</h3>
          <p className="section-copy">
            Track stock levels, pricing, and supplier information for all parts.
          </p>
        </div>
        <div className="parts-list-count">
          {filteredParts.length} part{filteredParts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {!filteredParts.length ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔧</div>
          <h4 className="empty-state-title">No parts found</h4>
          <p className="empty-state-copy">
            Add your first part to start tracking inventory.
          </p>
        </div>
      ) : (
        <div className="parts-grid">
          {filteredParts.map((part) => (
            <div className="part-card" key={part.part_id}>
              <div className="card-header">
                <div className="part-info">
                  <h4 className="part-name">{part.part_description}</h4>
                  <div className="supplier-info">{part.supplier_name}</div>
                </div>
                <div className="card-actions">
                  <button
                    aria-label={`View ${part.part_description}`}
                    className="icon-button"
                    onClick={() => onView(part.part_id)}
                    title="View details"
                    type="button"
                  >
                    ⓘ
                  </button>
                  <button
                    aria-label={`Edit ${part.part_description}`}
                    className="icon-button"
                    onClick={() => onEdit(part.part_id)}
                    title="Edit"
                    type="button"
                  >
                    ✎
                  </button>
                  <button
                    aria-label={`Delete ${part.part_description}`}
                    className="icon-button danger"
                    onClick={() => {
                      if (window.confirm(`Delete ${part.part_description}?`)) {
                        onDelete(part.part_id);
                      }
                    }}
                    title="Delete"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="card-body">
                <div className="pricing-row">
                  <span className="label">Supplier Cost</span>
                  <span className="value">£{part.supplier_cost.toFixed(2)}</span>
                </div>
                <div className="pricing-row">
                  <span className="label">Retail Price</span>
                  <span className="value">£{part.retail_price.toFixed(2)}</span>
                </div>
                <div className="pricing-row">
                  <span className="label">Margin</span>
                  <span className="value">
                    £{(part.retail_price - part.supplier_cost).toFixed(2)} ({(((part.retail_price - part.supplier_cost) / part.supplier_cost) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PartsList;
