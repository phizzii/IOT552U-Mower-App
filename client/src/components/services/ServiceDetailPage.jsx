import { startTransition, useCallback, useEffect, useState } from 'react';
import { fetchJson } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';

function ServiceDetailPage({ serviceId, onClose, onEdit }) {
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const serviceData = await fetchJson(`/services/${serviceId}`);

      startTransition(() => {
        setService(serviceData);
      });
    } catch (loadError) {
      setError(loadError.message || 'Service details could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="detail-overlay" role="dialog" aria-modal="true">
        <button aria-label="Close service detail" className="detail-backdrop" onClick={onClose} type="button" />
        <div className="detail-panel">
          <div className="detail-loading">Loading service details...</div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="detail-overlay" role="dialog" aria-modal="true">
        <button aria-label="Close service detail" className="detail-backdrop" onClick={onClose} type="button" />
        <div className="detail-panel">
          <div className="feedback-banner error">{error || 'Service not found'}</div>
          <button className="secondary-button" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true">
      <button aria-label="Close service detail" className="detail-backdrop" onClick={onClose} type="button" />

      <div className="detail-panel">
        <div className="detail-header">
          <div>
            <span className="section-label">Service Record</span>
            <h3 className="detail-title">{service.service_description}</h3>
            <p className="detail-subtitle">{service.machine_type_name || 'General service'}</p>
          </div>
          <div className="detail-actions">
            <button className="secondary-button" onClick={() => onEdit(service.service_id)} type="button">
              Edit Service
            </button>
            <button aria-label="Close details" className="close-button" onClick={onClose} type="button">
              ×
            </button>
          </div>
        </div>

        <div className="detail-content">
          <section className="detail-section surface-card">
            <div className="section-label">Service Details</div>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="label">Description</span>
                <span className="value">{service.service_description}</span>
              </div>
              <div className="detail-row">
                <span className="label">Machine type</span>
                <span className="value">{service.machine_type_name || 'General service'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Standard price</span>
                <span className="value">{formatCurrency(service.price)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetailPage;
