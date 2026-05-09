import { useMemo, useState } from 'react';
import usePagination from '../../hooks/usePagination';
import ExpandableRecord from '../shared/ExpandableRecord';
import PaginationControls from '../shared/PaginationControls';

function ServicesList({ services, onDelete, onEdit, onView }) {
  const [openServiceId, setOpenServiceId] = useState(null);
  const filteredServices = useMemo(() => services, [services]);
  const {
    currentPage,
    paginatedItems,
    range,
    setCurrentPage,
    totalItems,
    totalPages,
  } = usePagination(filteredServices);

  return (
    <div className="services-list-card surface-card">
      <div className="services-list-header">
        <div>
          <h3 className="section-title">Service Catalogue</h3>
        </div>
        <div className="services-list-count">
          {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
        </div>
      </div>

      {!filteredServices.length ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛠️</div>
          <h4 className="empty-state-title">No services configured</h4>
          <p className="empty-state-copy">
            Add standard service lines to keep pricing consistent across jobs.
          </p>
        </div>
      ) : (
        <>
        <div className="record-list">
          {paginatedItems.map((service) => (
            <ExpandableRecord
              actions={
                <>
                <button
                  aria-label={`View ${service.service_description}`}
                  className="icon-button"
                  onClick={() => onView(service.service_id)}
                  title="View details"
                  type="button"
                >
                  ⓘ
                </button>
                <button
                  aria-label={`Edit ${service.service_description}`}
                  className="icon-button"
                  onClick={() => onEdit(service.service_id)}
                  title="Edit"
                  type="button"
                >
                  ✎
                </button>
                <button
                  aria-label={`Delete ${service.service_description}`}
                  className="icon-button danger"
                  onClick={() => {
                    if (window.confirm(`Delete ${service.service_description}?`)) {
                      onDelete(service.service_id);
                    }
                  }}
                  title="Delete"
                  type="button"
                >
                  ×
                </button>
                </>
              }
              isOpen={openServiceId === service.service_id}
              key={service.service_id}
              onToggle={() =>
                setOpenServiceId((current) =>
                  current === service.service_id ? null : service.service_id
                )
              }
              subtitle={service.machine_type_name || 'General'}
              summary={`£${Number(service.price).toFixed(2)}`}
              title={service.service_description}
            >
              <div className="record-detail-grid">
                <div className="record-detail-item">
                  <span className="record-detail-label">Machine type</span>
                  <strong>{service.machine_type_name || 'General'}</strong>
                </div>
                <div className="record-detail-item">
                  <span className="record-detail-label">Price</span>
                  <strong>£{Number(service.price).toFixed(2)}</strong>
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
    </div>
  );
}

export default ServicesList;
