import DashboardSection from './DashboardSection';

function JobStatusAnalysisCard({ byStatus, incompleteCount, totalJobs }) {
  const maxCount = byStatus.reduce((highest, item) => Math.max(highest, item.count), 0);
  const incompletePercentage = totalJobs > 0 ? ((incompleteCount / totalJobs) * 100).toFixed(1) : 0;

  return (
    <DashboardSection eyebrow="Workshop Load" title="Job status snapshot">
      <div className="dashboard-status-list">
        {byStatus.map((item) => (
          <div className="dashboard-status-row" key={item.label}>
            <div className="dashboard-status-copy">
              <strong>{item.label}</strong>
              <span>{item.count} jobs</span>
            </div>
            <div className="dashboard-status-bar-wrap">
              <div
                className={`dashboard-status-bar ${!item.isComplete ? 'highlight' : ''}`}
                style={{
                  width: maxCount > 0 ? `${(item.count / maxCount) * 100}%` : '0%',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-inline-note">
        <span className="dashboard-inline-label">Machines not finished</span>
        <strong>{incompleteCount} jobs ({incompletePercentage}%)</strong>
      </div>
    </DashboardSection>
  );
}

export default JobStatusAnalysisCard;
