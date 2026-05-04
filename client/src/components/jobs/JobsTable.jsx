import { formatDate } from '../../utils/formatters';

function machineLabel(job) {
  const make = job.machine_make || 'Machine';
  const model = job.machine_model_no || 'Unspecified';

  return `${make} ${model}`;
}

function JobsTable({ jobs, onSelect, selectedJobId }) {
  return (
    <section className="surface-card jobs-table-card" data-reveal="jobs-table">
      <div className="jobs-table-header">
        <div>
          <span className="section-label">Jobs List</span>
          <h2 className="section-title jobs-panel-title">Active Repair Queue</h2>
        </div>
        <div className="jobs-table-count">{jobs.length} shown</div>
      </div>

      {jobs.length === 0 ? (
        <div className="jobs-empty-state">
          <strong>No jobs match the current filters.</strong>
          <span>Try widening the date range or switching back to all statuses.</span>
        </div>
      ) : (
        <div className="jobs-table-scroll">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Customer</th>
                <th>Machine</th>
                <th>Status</th>
                <th>Date Logged</th>
                <th>Assigned Mechanic</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const isSelected = job.job_no === selectedJobId;

                return (
                  <tr
                    className={isSelected ? 'is-selected' : ''}
                    key={job.job_no}
                    onClick={() => onSelect(job.job_no)}
                  >
                    <td>
                      <button
                        className="table-link-button"
                        onClick={() => onSelect(job.job_no)}
                        type="button"
                      >
                        #{job.job_no}
                      </button>
                    </td>
                    <td>{job.customer_first_name} {job.customer_last_name}</td>
                    <td>{machineLabel(job)}</td>
                    <td>
                      <span className="status-chip">{job.status || 'Unspecified'}</span>
                    </td>
                    <td>{formatDate(job.date_logged)}</td>
                    <td>{job.assigned_mechanic || 'Unassigned'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default JobsTable;
