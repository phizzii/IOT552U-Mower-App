import { useMemo, useState } from 'react';
import usePagination from '../../hooks/usePagination';
import ExpandableRecord from '../shared/ExpandableRecord';
import PaginationControls from '../shared/PaginationControls';

function PartsList({ onDelete, onEdit, onView, parts }) {
  const [openPartId, setOpenPartId] = useState(null);
  const filteredParts = useMemo(() => {
    return parts;
  }, [parts]);
  const {
    currentPage,
    paginatedItems,
    range,
    setCurrentPage,
    totalItems,
    totalPages,
  } = usePagination(filteredParts);

  return (
    <div className="parts-list-card surface-card">
      <div className="parts-list-header">
        <div>
          <h3 className="section-title">Parts Inventory</h3>
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
        <>
        <div className="record-list">
          {paginatedItems.map((part) => {
            const supplierCost = Number(part.supplier_cost) || 0;
            const retailPrice = Number(part.retail_price) || 0;
            const margin = retailPrice - supplierCost;
            const marginPercent =
              supplierCost > 0 ? `${((margin / supplierCost) * 100).toFixed(0)}%` : 'N/A';

            return (
              <ExpandableRecord
              actions={
                <>
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
                </>
              }
              isOpen={openPartId === part.part_id}
              key={part.part_id}
              onToggle={() =>
                setOpenPartId((current) => (current === part.part_id ? null : part.part_id))
              }
              subtitle={part.supplier_name || 'No supplier'}
              summary={`£${retailPrice.toFixed(2)}`}
              title={part.part_description}
            >
              <div className="record-detail-grid">
                <div className="record-detail-item">
                  <span className="record-detail-label">Supplier cost</span>
                  <strong>£{supplierCost.toFixed(2)}</strong>
                </div>
                <div className="record-detail-item">
                  <span className="record-detail-label">Retail price</span>
                  <strong>£{retailPrice.toFixed(2)}</strong>
                </div>
                <div className="record-detail-item">
                  <span className="record-detail-label">Margin</span>
                  <strong>
                    £{margin.toFixed(2)} (
                    {marginPercent}
                    )
                  </strong>
                </div>
              </div>
            </ExpandableRecord>
            );
          })}
        </div>
        <PaginationControls
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          range={range}
          totalItems={totalItems}
          totalPages={totalPages}
        />
        </>
      )}
    </div>
  );
}

export default PartsList;
