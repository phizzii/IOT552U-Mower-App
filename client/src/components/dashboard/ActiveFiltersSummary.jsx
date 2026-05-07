function ActiveFiltersSummary({ filters, machineTypes }) {
  const machineTypeName =
    machineTypes.find(
      (type) => String(type.machine_type_id) === String(filters.machineTypeId)
    )?.type_name || 'All machine types';

  const statusLabel = filters.status || 'All statuses';
  const topNLabel = filters.limit ? `Top ${filters.limit}` : 'Top 5';

  return (
    <section className="surface-card report-active-filters">
      <div className="section-label">Analysis Scope</div>
      <h3 className="section-title">Active Filters</h3>

      <div className="tag-row">
        <span className="tag">Status: {statusLabel}</span>
        <span className="tag">Machine Type: {machineTypeName}</span>
        <span className="tag">Ranking Scope: {topNLabel}</span>
      </div>
    </section>
  );
}

export default ActiveFiltersSummary;