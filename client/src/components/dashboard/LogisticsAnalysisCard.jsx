import DashboardSection from './DashboardSection';
import { formatCurrency } from '../../utils/formatters';

function LogisticsAnalysisCard({ summary, costDistanceAnalysis }) {
  return (
    <DashboardSection eyebrow="Logistics" title="Delivery & cost analysis">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="dashboard-kpi-card tone-forest">
          <span className="dashboard-kpi-label">Total deliveries</span>
          <strong className="dashboard-kpi-value">{summary.totalDeliveries}</strong>
          <p className="dashboard-kpi-detail">{summary.totalDistance} miles</p>
        </div>

        <div className="dashboard-kpi-card tone-forest">
          <span className="dashboard-kpi-label">Avg delivery charge</span>
          <strong className="dashboard-kpi-value">{formatCurrency(summary.avgCharge)}</strong>
          <p className="dashboard-kpi-detail">{summary.avgDistance} miles avg</p>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--ink-soft)' }}>
          Cost by distance
        </h4>
        <div className="dashboard-status-list">
          {costDistanceAnalysis.length > 0 ? (
            costDistanceAnalysis.map((bucket) => (
              <div className="dashboard-status-row" key={bucket.distanceBucket}>
                <div className="dashboard-status-copy">
                  <strong>~{bucket.distanceBucket} miles</strong>
                  <span>{bucket.deliveryCount} deliveries</span>
                </div>
                <div style={{ display: 'grid', gap: '4px', textAlign: 'right' }}>
                  <strong>{formatCurrency(bucket.avgCharge)}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--ink-faint)' }}>
                    {formatCurrency(bucket.costPerMile)}/mi
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>No delivery data available</p>
          )}
        </div>
      </div>

      <div className="dashboard-inline-note">
        <span className="dashboard-inline-label">Total delivery revenue</span>
        <strong>{formatCurrency(summary.totalCharge)}</strong>
      </div>
    </DashboardSection>
  );
}

export default LogisticsAnalysisCard;
