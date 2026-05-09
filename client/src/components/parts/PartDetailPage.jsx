import { startTransition, useCallback, useEffect, useState } from 'react';
import { fetchJson } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';

function PartDetailPage({ onClose, onEdit, partId }) {
  const [part, setPart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const partData = await fetchJson(`/parts/${partId}`);

      startTransition(() => {
        setPart(partData);
      });
    } catch (loadError) {
      setError(loadError.message || 'Part details could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [partId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="detail-overlay" role="dialog" aria-modal="true">
        <button
          aria-label="Close part detail"
          className="detail-backdrop"
          onClick={onClose}
          type="button"
        />
        <div className="detail-panel">
          <div className="detail-loading">Loading part details...</div>
        </div>
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="detail-overlay" role="dialog" aria-modal="true">
        <button
          aria-label="Close part detail"
          className="detail-backdrop"
          onClick={onClose}
          type="button"
        />
        <div className="detail-panel">
          <div className="feedback-banner error">{error || 'Part not found'}</div>
          <button className="secondary-button" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true">
      <button
        aria-label="Close part detail"
        className="detail-backdrop"
        onClick={onClose}
        type="button"
      />

      <div className="detail-panel">
        <div className="detail-header">
          <div>
            <span className="section-label">Part Record</span>
            <h3 className="detail-title">{part.part_description}</h3>
            <p className="detail-subtitle">
              {part.supplier_name || 'No supplier'}
            </p>
          </div>
          <div className="detail-actions">
            <button
              className="secondary-button"
              onClick={() => onEdit(part.part_id)}
              type="button"
            >
              Edit Part
            </button>
            <button
              aria-label="Close details"
              className="close-button"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        <div className="detail-content">
          <section className="detail-section surface-card">
            <div className="section-label">Part Details</div>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="label">Description</span>
                <span className="value">{part.part_description}</span>
              </div>
              <div className="detail-row">
                <span className="label">Supplier</span>
                <span className="value">{part.supplier_name || 'Not set'}</span>
              </div>
            </div>
          </section>

          <section className="detail-section surface-card">
            <div className="section-label">Pricing</div>
            <div className="stat-grid">
              <div className="stat-item">
                <div className="stat-value">{formatCurrency(part.supplier_cost)}</div>
                <div className="stat-label">Supplier Cost</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{formatCurrency(part.retail_price)}</div>
                <div className="stat-label">Retail Price</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {formatCurrency(Number(part.retail_price || 0) - Number(part.supplier_cost || 0))}
                </div>
                <div className="stat-label">Margin</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {Number(part.supplier_cost || 0) > 0
                    ? `${((((Number(part.retail_price || 0) - Number(part.supplier_cost || 0)) / Number(part.supplier_cost || 0)) * 100)).toFixed(0)}%`
                    : 'N/A'}
                </div>
                <div className="stat-label">Margin %</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PartDetailPage;
