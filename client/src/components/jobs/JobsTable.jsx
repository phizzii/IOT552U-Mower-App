import { useEffect } from 'react';
import usePagination from '../../hooks/usePagination';
import { formatDate } from '../../utils/formatters';
import PaginationControls from '../shared/PaginationControls';

const PAGE_SIZE = 10;

function machineLabel(job) {
  const make = job.machine_make || 'Machine';
  const model = job.machine_model_no || 'Unspecified';

  return `${make} ${model}`;
}

function JobsTable({ jobs, onSelect, selectedJobId }) {
  const {
    currentPage,
    paginatedItems,
    range,
    setCurrentPage,
    totalItems,
    totalPages,
  } = usePagination(jobs, {
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    if (!selectedJobId) {
      return;
    }

    const selectedIndex = jobs.findIndex((job) => job.job_no === selectedJobId);

    if (selectedIndex === -1) {
      return;
    }

    const nextPage = Math.floor(selectedIndex / PAGE_SIZE) + 1;
    setCurrentPage(nextPage);
  }, [jobs, selectedJobId, setCurrentPage]);

  function handlePageChange(page) {
    setCurrentPage(page);

    const firstJobOnPage = jobs[(page - 1) * PAGE_SIZE];
    if (firstJobOnPage) {
      onSelect(firstJobOnPage.job_no);
    }
  }

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
        <>
        <div className="jobs-table-scroll">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Customer</th>
                <th>Machine</th>
                <th>Status</th>
                <th>Date Logged</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((job) => {
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <PaginationControls
          currentPage={currentPage}
          onPageChange={handlePageChange}
          range={range}
          totalItems={totalItems}
          totalPages={totalPages}
        />
        </>
      )}
    </section>
  );
}

export default JobsTable;
