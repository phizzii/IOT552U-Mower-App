import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../config';


async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error || payload.errors?.join(', ') || 'The request could not be completed.';
    throw new Error(message);
  }

  return payload;
}

function ServiceDetailPage({ serviceId, onClose, onEdit }) {
  const [service, setService] = useState(null);
  const [jobLineItems, setJobLineItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [serviceData, jobLineItemsData] = await Promise.all([
        requestJson(`/services/${serviceId}`),
        requestJson('/job-line-items'),
      ]);

      startTransition(() => {
        setService(serviceData);
        setJobLineItems(jobLineItemsData.filter((item) => item.service_id === serviceData.service_id));
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

  const usageStats = useMemo(() => {
    if (!jobLineItems.length) {
      return { totalJobs: 0, totalRevenue: 0, averageRevenue: 0, lastUsed: null };
    }

    const totalRevenue = jobLineItems.reduce((sum, line) => sum + Number(line.line_total || 0), 0);
    const averageRevenue = totalRevenue / jobLineItems.length;
    const lastUsed = null;

    return {
      totalJobs: jobLineItems.length,
      totalRevenue,
      averageRevenue,
      lastUsed,
    };
  }, [jobLineItems]);

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
          <div className="detail-section">
            <h4 className="section-title">Pricing</h4>
            <div className="pricing-grid">
              <div className="pricing-item">
                <span className="pricing-label">Standard price</span>
                <span className="pricing-value">£{Number(service.price).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="section-title">Usage Summary</h4>
            <div className="statistics-grid">
              <div className="stat-item">
                <span className="stat-value">{usageStats.totalJobs}</span>
                <span className="stat-label">Job uses</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">£{usageStats.totalRevenue.toFixed(2)}</span>
                <span className="stat-label">Total revenue</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">£{usageStats.averageRevenue.toFixed(2)}</span>
                <span className="stat-label">Avg value</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {usageStats.lastUsed ? usageStats.lastUsed.toLocaleDateString() : 'Never'}
                </span>
                <span className="stat-label">Last used</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="section-title">Job Activity</h4>
            {!jobLineItems.length ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h5 className="empty-state-title">No job activity yet</h5>
                <p className="empty-state-copy">
                  This service has not yet been applied to any jobs.
                </p>
              </div>
            ) : (
              <div className="usage-history">
                {jobLineItems.map((item) => (
                  <div className="usage-item" key={item.line_item_id}>
                    <div className="usage-header">
                      <span className="job-number">Job #{item.job_no}</span>
                      <span className="usage-date">Unknown</span>
                    </div>
                    <div className="usage-details">
                      <span className="usage-quantity">£{Number(item.line_total).toFixed(2)}</span>
                      <span className="usage-total">{item.description || 'Service line'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetailPage;
