import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { fetchJson } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

function PartDetailPage({ onClose, onEdit, partId }) {
  const [part, setPart] = useState(null);
  const [jobParts, setJobParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [partData, jobPartsData] = await Promise.all([
        fetchJson(`/parts/${partId}`),
        fetchJson(`/job-parts?part_id=${partId}`),
      ]);

      startTransition(() => {
        setPart(partData);
        setJobParts(jobPartsData);
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

  const statistics = useMemo(() => {
    if (!jobParts.length) {
      return {
        totalUsed: 0,
        totalRevenue: 0,
        averagePrice: 0,
        lastUsed: null,
      };
    }

    const totalUsed = jobParts.reduce((sum, jp) => sum + jp.quantity, 0);
    const totalRevenue = jobParts.reduce((sum, jp) => sum + (jp.charge_price * jp.quantity), 0);
    const averagePrice = totalRevenue / totalUsed;
    const lastUsed = jobParts
      .map((jp) => new Date(jp.bill_date))
      .sort((a, b) => b - a)[0];

    return {
      totalUsed,
      totalRevenue,
      averagePrice,
      lastUsed,
    };
  }, [jobParts]);

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
            <h3 className="detail-title">{part.part_description}</h3>
            <p className="detail-subtitle">{part.supplier_name}</p>
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
          <div className="detail-section">
            <h4 className="section-title">Pricing Information</h4>
            <div className="pricing-grid">
              <div className="pricing-item">
                <span className="pricing-label">Supplier Cost</span>
                <span className="pricing-value">{formatCurrency(part.supplier_cost)}</span>
              </div>
              <div className="pricing-item">
                <span className="pricing-label">Retail Price</span>
                <span className="pricing-value">{formatCurrency(part.retail_price)}</span>
              </div>
              <div className="pricing-item">
                <span className="pricing-label">Margin</span>
                <span className="pricing-value">
                  {formatCurrency(part.retail_price - part.supplier_cost)}
                </span>
              </div>
              <div className="pricing-item">
                <span className="pricing-label">Margin %</span>
                <span className="pricing-value">
                  {(((part.retail_price - part.supplier_cost) / part.supplier_cost) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="section-title">Usage Statistics</h4>
            <div className="statistics-grid">
              <div className="stat-item">
                <span className="stat-value">{statistics.totalUsed}</span>
                <span className="stat-label">Total Used</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatCurrency(statistics.totalRevenue)}</span>
                <span className="stat-label">Total Revenue</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatCurrency(statistics.averagePrice)}</span>
                <span className="stat-label">Average Price</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {statistics.lastUsed ? formatDate(statistics.lastUsed.toISOString().slice(0, 10)) : 'Never'}
                </span>
                <span className="stat-label">Last Used</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="section-title">Usage History</h4>
            {!jobParts.length ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h5 className="empty-state-title">No usage history</h5>
                <p className="empty-state-copy">
                  This part hasn't been used in any jobs yet.
                </p>
              </div>
            ) : (
              <div className="usage-history">
                {jobParts.map((jobPart) => (
                  <div className="usage-item" key={jobPart.job_part_id}>
                    <div className="usage-header">
                      <span className="job-number">Job #{jobPart.job_no}</span>
                      <span className="usage-date">{formatDate(jobPart.bill_date)}</span>
                    </div>
                    <div className="usage-details">
                      <span className="usage-quantity">
                        {jobPart.quantity} × {formatCurrency(jobPart.charge_price)}
                      </span>
                      <span className="usage-total">
                        {formatCurrency(jobPart.quantity * jobPart.charge_price)}
                      </span>
                    </div>
                    {jobPart.bill_no && (
                      <div className="bill-reference">Bill: {jobPart.bill_no}</div>
                    )}
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

export default PartDetailPage;
