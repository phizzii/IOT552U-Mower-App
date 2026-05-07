import { useMemo, useState } from 'react';
import usePagination from '../../hooks/usePagination';
import ExpandableRecord from '../shared/ExpandableRecord';
import { formatCurrency, formatDate } from '../../utils/formatters';
import PaginationControls from '../shared/PaginationControls';

function SalesList({ onDelete, onEdit, onView, saleItems }) {
  const [openSaleItemId, setOpenSaleItemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const typeOptions = useMemo(
    () => [...new Set(saleItems.map((item) => item.type).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [saleItems]
  );
  const filteredSaleItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return saleItems.filter((saleItem) => {
      const matchesType = !typeFilter || saleItem.type === typeFilter;

      if (!matchesType) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        saleItem.customer_first_name,
        saleItem.customer_last_name,
        saleItem.type,
        saleItem.make,
        saleItem.model,
        saleItem.details,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [saleItems, searchTerm, typeFilter]);
  const {
    currentPage,
    paginatedItems,
    range,
    setCurrentPage,
    totalItems,
    totalPages,
  } = usePagination(filteredSaleItems, {
    resetKeys: [searchTerm, typeFilter],
  });

  return (
    <section className="surface-card sales-list-card" data-reveal="sales-list">
      <div className="machines-list-header">
        <div>
          <span className="section-label">Sales</span>
          <h2 className="section-title">Items For Sale</h2>
        </div>
        <div className="machines-list-count">{filteredSaleItems.length} shown</div>
      </div>

      <div className="filters-row">
        <div className="search-field-group">
          <input
            className="field-control"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by customer, type, make, model, or details..."
            type="text"
            value={searchTerm}
          />
        </div>

        <label className="field-group narrow">
          <span className="field-label">Type</span>
          <select
            className="field-control"
            onChange={(event) => setTypeFilter(event.target.value)}
            value={typeFilter}
          >
            <option value="">All Types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredSaleItems.length === 0 ? (
        <div className="empty-state">
          <strong>
            {saleItems.length === 0 ? 'No sale items yet.' : 'No sale items match your filters.'}
          </strong>
          <span>
            {saleItems.length === 0
              ? 'Add the first sale item to start tracking available and sold stock.'
              : 'Try different search terms or filters.'}
          </span>
        </div>
      ) : (
        <>
        <div className="record-list">
          {paginatedItems.map((saleItem) => (
            <ExpandableRecord
              actions={
                <>
                  <button
                    aria-label={`View sale item ${saleItem.sale_item_no}`}
                    className="icon-button"
                    onClick={() => onView(saleItem.sale_item_no)}
                    title="View details"
                    type="button"
                  >
                    ⓘ
                  </button>
                  <button
                    aria-label={`Edit sale item ${saleItem.sale_item_no}`}
                    className="icon-button"
                    onClick={() => onEdit(saleItem.sale_item_no)}
                    title="Edit"
                    type="button"
                  >
                    ✎
                  </button>
                  <button
                    aria-label={`Delete sale item ${saleItem.sale_item_no}`}
                    className="icon-button danger"
                    onClick={() => {
                      if (window.confirm(`Delete sale item #${saleItem.sale_item_no}?`)) {
                        onDelete(saleItem.sale_item_no);
                      }
                    }}
                    title="Delete"
                    type="button"
                  >
                    ×
                  </button>
                </>
              }
              isOpen={openSaleItemId === saleItem.sale_item_no}
              key={saleItem.sale_item_no}
              onToggle={() =>
                setOpenSaleItemId((current) =>
                  current === saleItem.sale_item_no ? null : saleItem.sale_item_no
                )
              }
              subtitle={[saleItem.type, saleItem.make, saleItem.model].filter(Boolean).join(' · ') || 'Sale item'}
              summary={formatCurrency(saleItem.price)}
              title={saleItem.details}
            >
              <div className="record-detail-grid">
                <div className="record-detail-item">
                  <span className="record-detail-label">Customer</span>
                  <strong>
                    {saleItem.customer_first_name} {saleItem.customer_last_name}
                  </strong>
                </div>
                <div className="record-detail-item">
                  <span className="record-detail-label">Date sold</span>
                  <strong>{formatDate(saleItem.date_sold)}</strong>
                </div>
                <div className="record-detail-item">
                  <span className="record-detail-label">Payment type</span>
                  <strong>{saleItem.payment_type || 'Not set'}</strong>
                </div>
              </div>
            </ExpandableRecord>
          ))}
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
    </section>
  );
}

export default SalesList;
