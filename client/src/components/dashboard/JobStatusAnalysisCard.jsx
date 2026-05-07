import DashboardSection from './DashboardSection';

function JobStatusAnalysisCard({ byStatus, incompleteCount, totalJobs }) {
  const maxCount = byStatus.reduce((highest, item) => Math.max(highest, Number(item.count) || 0), 0);
  const incompletePercentage = totalJobs > 0 ? ((incompleteCount / totalJobs) * 100).toFixed(1) : '0.0';

  return (
    <DashboardSection eyebrow="Workshop Load" title="Job Status Breakdown">
      <div className="report-kpi-strip">
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Total Jobs</span>
          <strong className="report-kpi-value">{totalJobs}</strong>
        </div>
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Incomplete Jobs</span>
          <strong className="report-kpi-value">{incompleteCount}</strong>
        </div>
        <div className="report-kpi-tile">
          <span className="report-kpi-label">Incomplete %</span>
          <strong className="report-kpi-value">{incompletePercentage}%</strong>
        </div>
      </div>

      {byStatus.length === 0 ? (
        <div className="report-empty-state">No job status data available</div>
      ) : (
        <div className="report-bar-list">
          {byStatus.map((item) => {
            const count = Number(item.count) || 0;
            const percentOfTotal = totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0;
            const toneClass = item.isComplete ? 'is-complete' : 'is-active';

            return (
              <article className="report-bar-row" key={item.label}>
                <div className="report-bar-header">
                  <div className="report-bar-copy">
                    <strong>{item.label}</strong>
                    <span>{count} jobs</span>
                  </div>
                  <span className="report-bar-value">{percentOfTotal}%</span>
                </div>

                <div className="report-bar-track">
                  <div
                    className={`report-bar-fill ${toneClass}`}
                    style={{ width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%' }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}

export default JobStatusAnalysisCard;
