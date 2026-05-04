import { useMemo, useState } from 'react';

function MachinesList({
  customers,
  machineTypes,
  machines,
  onDelete,
  onEdit,
  onView,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [machineTypeFilter, setMachineTypeFilter] = useState('');

  const filteredMachines = useMemo(() => {
    let filtered = machines;

    // Filter by machine type
    if (machineTypeFilter) {
      filtered = filtered.filter(
        (machine) => String(machine.machine_type_id) === String(machineTypeFilter)
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((machine) => {
        const customerName = `${machine.customer_first_name} ${machine.customer_last_name}`.toLowerCase();
        const machineInfo = `${machine.make} ${machine.model_no} ${machine.serial_no || ''}`.toLowerCase();
        
        return (
          customerName.includes(term) ||
          machineInfo.includes(term)
        );
      });
    }

    return filtered;
  }, [machines, searchTerm, machineTypeFilter]);

  return (
    <section className="surface-card machines-list-card" data-reveal="machines-list">
      <div className="machines-list-header">
        <div>
          <span className="section-label">Equipment</span>
          <h2 className="section-title">Machines & Ownership</h2>
        </div>
        <div className="machines-list-count">{filteredMachines.length} shown</div>
      </div>

      <div className="filters-row">
        <div className="search-field-group">
          <input
            className="field-control"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer, make, model, or serial..."
            type="text"
            value={searchTerm}
          />
        </div>

        <label className="field-group narrow">
          <span className="field-label">Machine Type</span>
          <select
            className="field-control"
            onChange={(e) => setMachineTypeFilter(e.target.value)}
            value={machineTypeFilter}
          >
            <option value="">All Types</option>
            {machineTypes.map((type) => (
              <option key={type.machine_type_id} value={type.machine_type_id}>
                {type.type_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredMachines.length === 0 ? (
        <div className="empty-state">
          <strong>
            {machines.length === 0 ? 'No machines yet.' : 'No machines match your filters.'}
          </strong>
          <span>
            {machines.length === 0
              ? 'Add the first machine to get started.'
              : 'Try different search terms or filters.'}
          </span>
        </div>
      ) : (
        <div className="machines-grid">
          {filteredMachines.map((machine) => (
            <div className="machine-card" key={machine.machine_id}>
              <div className="card-header">
                <div className="machine-info">
                  <div className="machine-name">
                    {machine.make} {machine.model_no}
                  </div>
                  <div className="machine-type">{machine.machine_type_name}</div>
                </div>
                <div className="card-actions">
                  <button
                    aria-label={`View ${machine.make} ${machine.model_no}`}
                    className="icon-button"
                    onClick={() => onView(machine.machine_id)}
                    title="View details"
                    type="button"
                  >
                    ⓘ
                  </button>
                  <button
                    aria-label={`Edit ${machine.make} ${machine.model_no}`}
                    className="icon-button"
                    onClick={() => onEdit(machine.machine_id)}
                    title="Edit"
                    type="button"
                  >
                    ✎
                  </button>
                  <button
                    aria-label={`Delete ${machine.make} ${machine.model_no}`}
                    className="icon-button danger"
                    onClick={() => {
                      if (window.confirm(`Delete ${machine.make} ${machine.model_no}?`)) {
                        onDelete(machine.machine_id);
                      }
                    }}
                    title="Delete"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="card-body">
                <div className="owner-info">
                  <span className="label">Owner</span>
                  <span className="value">
                    {machine.customer_first_name} {machine.customer_last_name}
                  </span>
                </div>

                {machine.serial_no && (
                  <div className="serial-info">
                    <span className="label">Serial</span>
                    <span className="value">{machine.serial_no}</span>
                  </div>
                )}

                {machine.other_no && (
                  <div className="other-info">
                    <span className="label">Other ID</span>
                    <span className="value">{machine.other_no}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MachinesList;
