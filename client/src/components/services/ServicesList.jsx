import { useMemo } from 'react';

function ServicesList({ services, onDelete, onEdit, onView }) {
  const filteredServices = useMemo(() => services, [services]);

  return (
    <div className="services-list-card surface-card">
      <div className="services-list-header">
        <div>
          <h3 className="section-title">Service Catalogue</h3>
          <p className="section-copy">
            Standard labour and service items for easy job quoting and billing.
          </p>
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
        <div className="services-grid">
          {filteredServices.map((service) => (
            <div className="service-card" key={service.service_id}>
              <div className="service-row">
                <div>
                  <h4 className="service-title">{service.service_description}</h4>
                  <div className="service-meta">{service.machine_type_name || 'General'}</div>
                </div>
                <div className="service-price">£{Number(service.price).toFixed(2)}</div>
              </div>

              <div className="card-actions service-actions">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServicesList;
