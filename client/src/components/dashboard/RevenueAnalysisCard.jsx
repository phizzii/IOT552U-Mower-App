import DashboardSection from './DashboardSection';
import { formatCurrency, formatShortDate } from '../../utils/formatters';

function buildLinePoints(points, width, height, paddingX, paddingY) {
  if (points.length === 0) {
    return [];
  }

  const maxRevenue = Math.max(...points.map((point) => Number(point.revenue) || 0), 1);
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  return points.map((point, index) => {
    const revenue = Number(point.revenue) || 0;
    const x = points.length === 1 ? width / 2 : paddingX + (usableWidth * index) / (points.length - 1);
    const y = height - paddingY - (revenue / maxRevenue) * usableHeight;

    return {
      ...point,
      revenue,
      x,
      y,
    };
  });
}

function RevenueAnalysisCard({ revenueOverTime, serviceBreakdown, totalRevenue }) {
  const chartWidth = 560;
  const chartHeight = 220;
  const linePoints = buildLinePoints(revenueOverTime, chartWidth, chartHeight, 24, 20);
  const polylinePoints = linePoints.map((point) => `${point.x},${point.y}`).join(' ');
  const maxServiceRevenue = serviceBreakdown.reduce(
    (highest, item) => Math.max(highest, Number(item.revenue) || 0),
    0
  );
  const averageRevenue =
    revenueOverTime.length > 0
      ? totalRevenue / revenueOverTime.length
      : 0;

  return (
    <DashboardSection eyebrow="Financial Trends" title="Revenue Over Time">
      <div className="report-kpi-strip report-kpi-strip--two-up">
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Total Revenue</span>
          <strong className="report-kpi-value">{formatCurrency(totalRevenue)}</strong>
        </div>
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Average Per Period</span>
          <strong className="report-kpi-value">{formatCurrency(averageRevenue)}</strong>
        </div>
      </div>

      <div className="report-chart-block">
        <div className="report-chart-heading">
          <strong>Revenue trend</strong>
          <span>Paid invoice value by date</span>
        </div>

        {linePoints.length === 0 ? (
          <div className="report-empty-state">No revenue trend data available</div>
        ) : (
          <div className="report-line-chart-card">
            <svg
              aria-label="Revenue over time line chart"
              className="report-line-chart"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            >
              {[0.25, 0.5, 0.75, 1].map((step) => (
                <line
                  className="report-line-grid"
                  key={step}
                  x1="24"
                  x2={chartWidth - 24}
                  y1={chartHeight - 20 - (chartHeight - 40) * step}
                  y2={chartHeight - 20 - (chartHeight - 40) * step}
                />
              ))}

              <polyline
                className="report-line-path"
                fill="none"
                points={polylinePoints}
              />

              {linePoints.map((point) => (
                <circle
                  className="report-line-point"
                  cx={point.x}
                  cy={point.y}
                  key={point.date}
                  r="5"
                />
              ))}
            </svg>

            <div className="report-line-axis">
              {linePoints.map((point) => (
                <div className="report-line-axis-item" key={point.date}>
                  <span>{formatShortDate(point.date)}</span>
                  <strong>{formatCurrency(point.revenue)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="report-chart-block">
        <div className="report-chart-heading">
          <strong>Top services by revenue</strong>
          <span>Highest-earning service lines</span>
        </div>

        {serviceBreakdown.length === 0 ? (
          <div className="report-empty-state">No service revenue data available</div>
        ) : (
          <div className="report-bar-list">
            {serviceBreakdown.slice(0, 5).map((service) => {
              const revenue = Number(service.revenue) || 0;

              return (
                <article className="report-bar-row" key={service.service}>
                  <div className="report-bar-header">
                    <div className="report-bar-copy">
                      <strong>{service.service}</strong>
                      <span>{service.jobCount} jobs</span>
                    </div>
                    <span className="report-bar-value">{formatCurrency(revenue)}</span>
                  </div>

                  <div className="report-bar-track">
                    <div
                      className="report-bar-fill is-revenue"
                      style={{
                        width: maxServiceRevenue > 0 ? `${(revenue / maxServiceRevenue) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardSection>
  );
}

export default RevenueAnalysisCard;
