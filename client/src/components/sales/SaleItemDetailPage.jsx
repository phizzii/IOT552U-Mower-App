import { startTransition, useCallback, useEffect, useState } from 'react';
import { fetchJson } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

function SaleItemDetailPage({ onClose, onEdit, saleItemId }) {
  const [saleItem, setSaleItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const saleItemData = await fetchJson(`/sale-items/${saleItemId}`);

      startTransition(() => {
        setSaleItem(saleItemData);
      });
    } catch (loadError) {
      setError(loadError.message || 'Sale item details could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [saleItemId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="detail-overlay" role="dialog" aria-modal="true">
        <button aria-label="Close sale item detail" className="detail-backdrop" onClick={onClose} type="button" />
        <div className="detail-panel">
          <div className="detail-loading">Loading sale item details...</div>
        </div>
      </div>
    );
  }

  if (error || !saleItem) {
    return (
      <div className="detail-overlay" role="dialog" aria-modal="true">
        <button aria-label="Close sale item detail" className="detail-backdrop" onClick={onClose} type="button" />
        <div className="detail-panel">
          <div className="feedback-banner error">{error || 'Sale item not found'}</div>
          <button className="secondary-button" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true">
      <button aria-label="Close sale item detail" className="detail-backdrop" onClick={onClose} type="button" />

      <div className="detail-panel">
        <div className="detail-header">
          <div>
            <span className="section-label">Sale Item Record</span>
            <h3 className="detail-title">{saleItem.details}</h3>
            <p className="detail-subtitle">
              {[saleItem.type, saleItem.make, saleItem.model].filter(Boolean).join(' · ') || 'Sale item'}
            </p>
          </div>
          <div className="detail-actions">
            <button className="secondary-button" onClick={() => onEdit(saleItem.sale_item_no)} type="button">
              Edit Sale Item
            </button>
            <button aria-label="Close details" className="close-button" onClick={onClose} type="button">
              ×
            </button>
          </div>
        </div>

        <div className="detail-content">
          <section className="detail-section surface-card">
            <div className="section-label">Item Details</div>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="label">Customer</span>
                <span className="value">
                  {saleItem.customer_first_name} {saleItem.customer_last_name}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Type</span>
                <span className="value">{saleItem.type || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Make / model</span>
                <span className="value">{[saleItem.make, saleItem.model].filter(Boolean).join(' ') || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Date sold</span>
                <span className="value">{formatDate(saleItem.date_sold)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Payment type</span>
                <span className="value">{saleItem.payment_type || 'Not set'}</span>
              </div>
            </div>
          </section>

          <section className="detail-section surface-card">
            <div className="section-label">Value</div>
            <div className="stat-grid">
              <div className="stat-item">
                <div className="stat-value">{formatCurrency(saleItem.price)}</div>
                <div className="stat-label">Sale Price</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SaleItemDetailPage;
