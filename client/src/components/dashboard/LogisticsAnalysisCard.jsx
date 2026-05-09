import { useMemo, useState } from 'react';
import DashboardSection from './DashboardSection';
import { formatCurrency } from '../../utils/formatters';

function LogisticsAnalysisCard({ costDistanceAnalysis = [], summary = {} }) {
  const [sortBy, setSortBy] = useState('distance');

  const sortedBuckets = useMemo(() => {
    const buckets = [...costDistanceAnalysis];

    return buckets.sort((left, right) => {
      if (sortBy === 'deliveryCount') {
        return Number(right.deliveryCount || 0) - Number(left.deliveryCount || 0);
      }

      if (sortBy === 'avgCharge') {
        return Number(right.avgCharge || 0) - Number(left.avgCharge || 0);
      }

      if (sortBy === 'costPerMile') {
        return Number(right.costPerMile || 0) - Number(left.costPerMile || 0);
      }

      return Number(left.distanceBucket || 0) - Number(right.distanceBucket || 0);
    });
  }, [costDistanceAnalysis, sortBy]);

  const maxValues = useMemo(() => {
    return sortedBuckets.reduce(
      (acc, bucket) => {
        acc.deliveryCount = Math.max(acc.deliveryCount, Number(bucket.deliveryCount) || 0);
        acc.avgCharge = Math.max(acc.avgCharge, Number(bucket.avgCharge) || 0);
        acc.costPerMile = Math.max(acc.costPerMile, Number(bucket.costPerMile) || 0);
        return acc;
      },
      {
        deliveryCount: 0,
        avgCharge: 0,
        costPerMile: 0,
      }
    );
  }, [sortedBuckets]);

  function getSortLabel() {
    if (sortBy === 'deliveryCount') return 'Ranked by delivery volume';
    if (sortBy === 'avgCharge') return 'Ranked by average delivery charge';
    if (sortBy === 'costPerMile') return 'Ranked by charge per mile';
    return 'Ranked by distance bucket';
  }

  function getMetricHeight(value, maxValue) {
    if (!maxValue || maxValue <= 0) return '10%';
    return `${Math.max((value / maxValue) * 100, 10)}%`;
  }

  function getBarHeights(bucket) {
    const deliveryCount = Number(bucket.deliveryCount) || 0;
    const avgCharge = Number(bucket.avgCharge) || 0;
    const costPerMile = Number(bucket.costPerMile) || 0;

    if (sortBy === 'deliveryCount') {
      const height = getMetricHeight(deliveryCount, maxValues.deliveryCount);
      return {
        leftHeight: height,
        rightHeight: height,
        leftTitle: `Deliveries: ${deliveryCount}`,
        rightTitle: `Deliveries: ${deliveryCount}`,
      };
    }

    if (sortBy === 'avgCharge') {
      const height = getMetricHeight(avgCharge, maxValues.avgCharge);
      return {
        leftHeight: height,
        rightHeight: height,
        leftTitle: `Average charge: ${formatCurrency(avgCharge)}`,
        rightTitle: `Average charge: ${formatCurrency(avgCharge)}`,
      };
    }

    if (sortBy === 'costPerMile') {
      const height = getMetricHeight(costPerMile, maxValues.costPerMile);
      return {
        leftHeight: height,
        rightHeight: height,
        leftTitle: `Cost per mile: ${formatCurrency(costPerMile)}/mi`,
        rightTitle: `Cost per mile: ${formatCurrency(costPerMile)}/mi`,
      };
    }

    return {
      leftHeight: getMetricHeight(avgCharge, maxValues.avgCharge),
      rightHeight: getMetricHeight(costPerMile, maxValues.costPerMile),
      leftTitle: `Average charge: ${formatCurrency(avgCharge)}`,
      rightTitle: `Cost per mile: ${formatCurrency(costPerMile)}/mi`,
    };
  }

  return (
    <DashboardSection eyebrow="Logistics" title="Delivery Cost vs Distance">
      <div className="report-kpi-strip">
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Total Deliveries</span>
          <strong className="report-kpi-value">{summary.totalDeliveries || 0}</strong>
        </div>
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Average Distance</span>
          <strong className="report-kpi-value">{summary.avgDistance || 0} mi</strong>
        </div>
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Average Charge</span>
          <strong className="report-kpi-value">{formatCurrency(summary.avgCharge || 0)}</strong>
        </div>
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Delivery Revenue</span>
          <strong className="report-kpi-value">{formatCurrency(summary.totalCharge || 0)}</strong>
        </div>
      </div>

      <div className="report-chart-block">
        <div className="report-chart-heading">
          <strong>Distance bucket comparison</strong>
          <span>Compare average delivery charge with charge per mile across distance ranges</span>
        </div>

        <div className="toggle-row">
          <button
            className={`toggle-chip ${sortBy === 'distance' ? 'is-active' : ''}`}
            onClick={() => setSortBy('distance')}
            type="button"
          >
            Sort by distance
          </button>
          <button
            className={`toggle-chip ${sortBy === 'deliveryCount' ? 'is-active' : ''}`}
            onClick={() => setSortBy('deliveryCount')}
            type="button"
          >
            Sort by deliveries
          </button>
          <button
            className={`toggle-chip ${sortBy === 'avgCharge' ? 'is-active' : ''}`}
            onClick={() => setSortBy('avgCharge')}
            type="button"
          >
            Sort by charge
          </button>
          <button
            className={`toggle-chip ${sortBy === 'costPerMile' ? 'is-active' : ''}`}
            onClick={() => setSortBy('costPerMile')}
            type="button"
          >
            Sort by cost per mile
          </button>
        </div>

        <div className="dashboard-inline-note">
          <span className="dashboard-inline-label">Current ordering</span>
          <strong>{getSortLabel()}</strong>
        </div>

        {sortedBuckets.length === 0 ? (
          <div className="report-empty-state">No delivery analysis data available</div>
        ) : (
          <>
            <div className="report-group-chart">
              {sortedBuckets.map((bucket, index) => {
                const avgCharge = Number(bucket.avgCharge) || 0;
                const costPerMile = Number(bucket.costPerMile) || 0;
                const { leftHeight, rightHeight, leftTitle, rightTitle } = getBarHeights(bucket);

                return (
                  <article className="report-group-column" key={bucket.distanceBucket}>
                    <div className="report-rank-badge">#{index + 1}</div>

                    <div className="report-group-bars">
                      <div className="report-group-bar-wrap">
                        <div
                          className="report-group-bar is-charge"
                          style={{ height: leftHeight }}
                          title={leftTitle}
                        />
                      </div>
                      <div className="report-group-bar-wrap">
                        <div
                          className="report-group-bar is-mile"
                          style={{ height: rightHeight }}
                          title={rightTitle}
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

            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Distance Bucket</th>
                    <th>Deliveries</th>
                    <th>Average Charge</th>
                    <th>Cost per Mile</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBuckets.map((bucket, index) => (
                    <tr key={`table-${bucket.distanceBucket}`}>
                      <td>#{index + 1}</td>
                      <td>~{bucket.distanceBucket} mi</td>
                      <td>{bucket.deliveryCount}</td>
                      <td>{formatCurrency(bucket.avgCharge || 0)}</td>
                      <td>{formatCurrency(bucket.costPerMile || 0)}/mi</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardSection>
  );
}

export default LogisticsAnalysisCard;