import { useMemo, useState } from 'react';
import usePagination from '../../hooks/usePagination';
import ExpandableRecord from '../shared/ExpandableRecord';
import PaginationControls from '../shared/PaginationControls';

function MachinesList({
  machineTypes,
  machines,
  onDelete,
  onEdit,
  onView,
}) {
  const [openMachineId, setOpenMachineId] = useState(null);
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
  const {
    currentPage,
    paginatedItems,
    range,
    setCurrentPage,
    totalItems,
    totalPages,
  } = usePagination(filteredMachines, {
    resetKeys: [searchTerm, machineTypeFilter],
  });

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
        <>
        <div className="record-list">
          {paginatedItems.map((machine) => (
            <ExpandableRecord
              actions={
                <>
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
                </>
              }
              isOpen={openMachineId === machine.machine_id}
              key={machine.machine_id}
              onToggle={() =>
                setOpenMachineId((current) =>
                  current === machine.machine_id ? null : machine.machine_id
                )
              }
              subtitle={machine.machine_type_name || 'No type'}
              summary={`${machine.customer_first_name} ${machine.customer_last_name}`}
              title={`${machine.make} ${machine.model_no}`}
            >
              <div className="record-detail-grid">
                <div className="record-detail-item">
                  <span className="record-detail-label">Owner</span>
                  <strong>
                    {machine.customer_first_name} {machine.customer_last_name}
                  </strong>
                </div>
                <div className="record-detail-item">
                  <span className="record-detail-label">Serial</span>
                  <strong>{machine.serial_no || 'Not set'}</strong>
                </div>
                <div className="record-detail-item record-detail-item--wide">
                  <span className="record-detail-label">Other ID</span>
                  <strong>{machine.other_no || 'Not set'}</strong>
                </div>
              </div>
            </ExpandableRecord>
          ))}
        </div>
        <PaginationControls
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          range={range}
          totalItems={totalItems}
          totalPages={totalPages}
        />
        </>
      )}
    </section>
  );
}

export default MachinesList;
