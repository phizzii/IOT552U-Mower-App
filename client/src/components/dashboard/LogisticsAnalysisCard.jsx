import DashboardSection from './DashboardSection';
import { formatCurrency } from '../../utils/formatters';

function LogisticsAnalysisCard({ costDistanceAnalysis, summary }) {
  const maxMetric = costDistanceAnalysis.reduce((highest, bucket) => {
    return Math.max(
      highest,
      Number(bucket.avgCharge) || 0,
      Number(bucket.costPerMile) || 0
    );
  }, 0);

  return (
    <DashboardSection eyebrow="Logistics" title="Delivery Cost vs Distance">
      <div className="report-kpi-strip">
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Total Deliveries</span>
          <strong className="report-kpi-value">{summary.totalDeliveries}</strong>
        </div>
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Average Distance</span>
          <strong className="report-kpi-value">{summary.avgDistance || 0} mi</strong>
        </div>
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Average Charge</span>
          <strong className="report-kpi-value">{formatCurrency(summary.avgCharge)}</strong>
        </div>
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Delivery Revenue</span>
          <strong className="report-kpi-value">{formatCurrency(summary.totalCharge)}</strong>
        </div>
      </div>

      <div className="report-chart-heading">
        <strong>Distance bucket comparison</strong>
        <span>Average charge compared with charge per mile</span>
      </div>

      {costDistanceAnalysis.length === 0 ? (
        <div className="report-empty-state">No delivery analysis data available</div>
      ) : (
        <div className="report-group-chart">
          {costDistanceAnalysis.map((bucket) => {
            const avgCharge = Number(bucket.avgCharge) || 0;
            const costPerMile = Number(bucket.costPerMile) || 0;

            return (
              <article className="report-group-column" key={bucket.distanceBucket}>
                <div className="report-group-bars">
                  <div className="report-group-bar-wrap">
                    <div
                      className="report-group-bar is-charge"
                      style={{
                        height: maxMetric > 0 ? `${Math.max((avgCharge / maxMetric) * 100, 10)}%` : '10%',
                      }}
                    />
                  </div>
                  <div className="report-group-bar-wrap">
                    <div
                      className="report-group-bar is-mile"
                      style={{
                        height: maxMetric > 0 ? `${Math.max((costPerMile / maxMetric) * 100, 10)}%` : '10%',
                      }}
                    />
                  </div>
                </div>

                <div className="report-group-label">~{bucket.distanceBucket} mi</div>
                <div className="report-group-meta">
                  <span>{bucket.deliveryCount} deliveries</span>
                  <strong>{formatCurrency(avgCharge)}</strong>
                  <span>{formatCurrency(costPerMile)}/mi</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}

export default LogisticsAnalysisCard;
