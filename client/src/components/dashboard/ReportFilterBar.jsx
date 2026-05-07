function ReportFilterBar({

  filters,

  machineTypes,

  onChange,

  onReset,

}) {

  return (
<section className="surface-card report-filter-bar">
<div className="report-filter-header">
<div>
<div className="section-label">Analysis Controls</div>
<h3 className="section-title">Filter Reports</h3>
</div>
</div>
 
      <div className="report-filter-grid">
<div className="field-group">
<label className="field-label" htmlFor="report-status-filter">

            Job Status
</label>
<select

            id="report-status-filter"

            className="field-control"

            value={filters.status}

            onChange={(event) => onChange('status', event.target.value)}
>
<option value="">All statuses</option>
<option value="Logged">Logged</option>
<option value="In Progress">In Progress</option>
<option value="Awaiting Parts">Awaiting Parts</option>
<option value="Ready for Collection">Ready for Collection</option>
<option value="Completed">Completed</option>
<option value="Collected">Collected</option>
</select>
</div>
 
        <div className="field-group">
<label className="field-label" htmlFor="report-machine-type-filter">

            Machine Type
</label>
<select

            id="report-machine-type-filter"

            className="field-control"

            value={filters.machineTypeId}

            onChange={(event) => onChange('machineTypeId', event.target.value)}
>
<option value="">All machine types</option>

            {machineTypes.map((type) => (
<option key={type.machine_type_id} value={type.machine_type_id}>

                {type.type_name}
</option>

            ))}
</select>
</div>
 
        <div className="field-group narrow">
<label className="field-label" htmlFor="report-limit-filter">

            Top N
</label>
<select

            id="report-limit-filter"

            className="field-control"

            value={filters.limit}

            onChange={(event) => onChange('limit', event.target.value)}
>
<option value="5">Top 5</option>
<option value="10">Top 10</option>
<option value="15">Top 15</option>
<option value="20">Top 20</option>
</select>
</div>
</div>
 
      <div className="jobs-filter-actions">
<button className="secondary-button" onClick={onReset} type="button">

          Reset filters
</button>
</div>
</section>

  );

}
 
export default ReportFilterBar;
 