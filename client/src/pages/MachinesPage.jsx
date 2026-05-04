import { startTransition, useEffect, useState } from 'react';
import MachinesList from '../components/machines/MachinesList';
import MachineForm from '../components/machines/MachineForm';
import MachineDetailPage from '../components/machines/MachineDetailPage';
import PageHeader from '../components/navigation/PageHeader';
import { fetchJson } from '../utils/api';

function MachinesPage() {
  const [customers, setCustomers] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [machines, setMachines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Form state
  const [formState, setFormState] = useState({
    isOpen: false,
    mode: 'create',
    machine: null,
    isSubmitting: false,
  });

  // Detail view state
  const [detailState, setDetailState] = useState({
    isOpen: false,
    machineId: null,
  });

  // Load all data
  async function loadData() {
    setIsLoading(true);
    setError('');

    try {
      const [customersData, machineTypesData, machinesData] = await Promise.all([
        fetchJson('/customers'),
        fetchJson('/machine-types'),
        fetchJson('/machines'),
      ]);

      startTransition(() => {
        setCustomers(customersData);
        setMachineTypes(machineTypesData);
        setMachines(machinesData);
      });
    } catch (loadError) {
      setError(loadError.message || 'Machine data could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Form handlers
  function handleAddMachine() {
    setFormState({
      isOpen: true,
      mode: 'create',
      machine: null,
      isSubmitting: false,
    });
    setActionError('');
    setActionMessage('');
  }

  async function handleEditMachine(machineId) {
    const machine = machines.find((m) => m.machine_id === machineId);

    if (!machine) {
      setActionError('Machine not found.');
      return;
    }

    setFormState({
      isOpen: true,
      mode: 'edit',
      machine,
      isSubmitting: false,
    });
    setActionError('');
    setActionMessage('');
  }

  async function handleFormSubmit(formData) {
    setFormState((current) => ({ ...current, isSubmitting: true }));
    setActionError('');
    setActionMessage('');

    try {
      if (formState.mode === 'create') {
        await fetchJson('/machines', {
          body: JSON.stringify(formData),
          method: 'POST',
        });

        setActionMessage('Machine created successfully.');
        setFormState({ isOpen: false, mode: 'create', machine: null, isSubmitting: false });
        await loadData();
      } else {
        await fetchJson(`/machines/${formState.machine.machine_id}`, {
          body: JSON.stringify(formData),
          method: 'PUT',
        });

        setActionMessage('Machine updated successfully.');
        setFormState({ isOpen: false, mode: 'edit', machine: null, isSubmitting: false });
        await loadData();
      }
    } catch (submitError) {
      setActionError(submitError.message || 'The request could not be completed.');
      setFormState((current) => ({ ...current, isSubmitting: false }));
    }
  }

  function handleFormClose() {
    setFormState({ isOpen: false, mode: 'create', machine: null, isSubmitting: false });
    setActionError('');
  }

  // Delete handler
  async function handleDeleteMachine(machineId) {
    setActionError('');
    setActionMessage('');

    try {
      await fetchJson(`/machines/${machineId}`, {
        method: 'DELETE',
      });

      setActionMessage('Machine deleted successfully.');
      await loadData();
    } catch (deleteError) {
      setActionError(deleteError.message || 'Could not delete machine.');
    }
  }

  // Detail view handlers
  function handleViewMachine(machineId) {
    setDetailState({ isOpen: true, machineId });
  }

  function handleDetailClose() {
    setDetailState({ isOpen: false, machineId: null });
  }

  return (
    <div className="page-wrapper">
      <PageHeader
        eyebrow="Equipment Tracking"
        summary="Machines should bridge customer profiles and repair history, giving you a cleaner operational picture than jumping between separate records."
        title="Machines"
      />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {actionError ? <div className="feedback-banner error">{actionError}</div> : null}
      {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}

      <div className="page-grid">
        <div className="page-stack">
          <section className="surface-card hero-card" data-reveal="intro">
            <div>
              <div className="section-label">Asset Management</div>
              <h3 className="section-title">Track equipment ownership</h3>
              <p className="section-copy">
                Link machines to customers and monitor maintenance history.
                Each piece of equipment becomes part of the service workflow.
              </p>
            </div>

            <button className="primary-button" onClick={handleAddMachine} type="button">
              + New Machine
            </button>
          </section>

          {isLoading ? (
            <div className="surface-card">
              <div className="loading-state">Loading machines...</div>
            </div>
          ) : (
            <MachinesList
              customers={customers}
              machineTypes={machineTypes}
              machines={machines}
              onDelete={handleDeleteMachine}
              onEdit={handleEditMachine}
              onView={handleViewMachine}
            />
          )}
        </div>
      </div>

      {/* Modal components */}
      <MachineForm
        customers={customers}
        error={actionError}
        isOpen={formState.isOpen}
        isSubmitting={formState.isSubmitting}
        machine={formState.machine}
        machineTypes={machineTypes}
        mode={formState.mode}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      {detailState.isOpen && (
        <MachineDetailPage
          machineId={detailState.machineId}
          onClose={handleDetailClose}
          onEdit={handleEditMachine}
        />
      )}
    </div>
  );
}

export default MachinesPage;
