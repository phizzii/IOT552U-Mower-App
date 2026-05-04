function JobsFilterBar({
  customers,
  filters,
  onChange,
  onCreateJob,
  onReset,
  statuses,
}) {
  return (
    <section className="surface-card jobs-filter-bar" data-reveal="jobs-filters">
      <div className="jobs-filter-copy">
        <span className="section-label">Workflow Filters</span>
        <h2 className="section-title jobs-panel-title">Workshop Queue</h2>
        <p className="section-copy">
          Focus the live jobs list by status, customer, and logged date, then open
          a job to manage parts, labour, and billing in one place.
        </p>
      </div>

      <div className="jobs-filter-grid">
        <label className="field-group">
          <span className="field-label">Status</span>
          <select
            className="field-control"
            onChange={(event) => onChange('status', event.target.value)}
            value={filters.status}
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="field-group">
          <span className="field-label">Customer</span>
          <select
            className="field-control"
            onChange={(event) => onChange('customerId', event.target.value)}
            value={filters.customerId}
          >
            <option value="">All customers</option>
            {customers.map((customer) => (
              <option key={customer.customer_id} value={customer.customer_id}>
                {customer.first_name} {customer.last_name}
              </option>
            ))}
          </select>
        </label>

        <label className="field-group">
          <span className="field-label">From</span>
          <input
            className="field-control"
            onChange={(event) => onChange('startDate', event.target.value)}
            type="date"
            value={filters.startDate}
          />
        </label>

        <label className="field-group">
          <span className="field-label">To</span>
          <input
            className="field-control"
            onChange={(event) => onChange('endDate', event.target.value)}
            type="date"
            value={filters.endDate}
          />
        </label>
      </div>

      <div className="jobs-filter-actions">
        <button className="primary-button" onClick={onCreateJob} type="button">
          New Repair Job
        </button>
        <button className="secondary-button" onClick={onReset} type="button">
          Reset Filters
        </button>
      </div>
    </section>
  );
}

export default JobsFilterBar;
