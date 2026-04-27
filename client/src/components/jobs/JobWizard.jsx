import { useEffect, useMemo, useState } from 'react';

const steps = [
  { id: 1, title: 'Customer' },
  { id: 2, title: 'Machine' },
  { id: 3, title: 'Issue' },
  { id: 4, title: 'Assignment' },
];

function createInitialState(initialJob) {
  return {
    assigned_mechanic: initialJob?.assigned_mechanic || '',
    contact_method: initialJob?.contact_method || 'Phone',
    customer_id: initialJob?.customer_id ? String(initialJob.customer_id) : '',
    date_collected: initialJob?.date_collected || '',
    date_finished: initialJob?.date_finished || '',
    date_logged: initialJob?.date_logged || new Date().toISOString().slice(0, 10),
    date_return: initialJob?.date_return || '',
    instruction: initialJob?.instruction || '',
    machineChoice: 'existing',
    machine_id: initialJob?.machine_id ? String(initialJob.machine_id) : '',
    newMachine: {
      machine_type_id: '',
      make: '',
      model_no: '',
      other_no: '',
      serial_no: '',
    },
    notes: initialJob?.notes || '',
    status: initialJob?.status || 'Logged',
  };
}

function JobWizard({
  customers,
  initialJob,
  isOpen,
  isSubmitting,
  machineTypes,
  machines,
  mode,
  onClose,
  onSubmit,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState(createInitialState(initialJob));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCurrentStep(1);
    setError('');
    setFormState(createInitialState(initialJob));
  }, [initialJob, isOpen]);

  const customerMachines = useMemo(
    () =>
      machines.filter(
        (machine) => String(machine.customer_id) === String(formState.customer_id || '')
      ),
    [formState.customer_id, machines]
  );

  if (!isOpen) {
    return null;
  }

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateNewMachineField(field, value) {
    setFormState((current) => ({
      ...current,
      newMachine: {
        ...current.newMachine,
        [field]: value,
      },
    }));
  }

  function validateStep(step) {
    if (step === 1 && !formState.customer_id) {
      return 'Choose the customer first so the repair job is linked correctly.';
    }

    if (step === 2) {
      if (formState.machineChoice === 'existing' && !formState.machine_id) {
        return 'Select an existing machine or switch to add a new machine.';
      }

      if (formState.machineChoice === 'new') {
        if (!formState.newMachine.machine_type_id || !formState.newMachine.make || !formState.newMachine.model_no) {
          return 'New machines need a type, make, and model before you continue.';
        }
      }
    }

    if (step === 3 && (!formState.date_logged || !formState.instruction)) {
      return 'Add the logged date and the initial issue description before moving on.';
    }

    if (step === 4 && !formState.assigned_mechanic) {
      return 'Assign the job to a mechanic so it appears clearly in the workshop queue.';
    }

    return '';
  }

  function handleNext() {
    const validationMessage = validateStep(currentStep);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setError('');
    setCurrentStep((value) => Math.min(value + 1, steps.length));
  }

  function handlePrevious() {
    setError('');
    setCurrentStep((value) => Math.max(value - 1, 1));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationMessage = validateStep(currentStep);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setError('');
    await onSubmit(formState);
  }

  return (
    <div className="wizard-overlay" role="dialog" aria-modal="true">
      <button
        aria-label="Close repair job wizard"
        className="wizard-backdrop"
        onClick={onClose}
        type="button"
      />

      <form className="wizard-panel" onSubmit={handleSubmit}>
        <div className="wizard-header">
          <div>
            <span className="section-label">Guided Intake</span>
            <h2 className="section-title jobs-panel-title">
              {mode === 'edit' ? 'Edit Repair Job' : 'Create Repair Job'}
            </h2>
            <p className="section-copy">
              Move through the workflow step by step instead of forcing the whole
              intake into one long form.
            </p>
          </div>

          <button className="secondary-button" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="wizard-steps">
          {steps.map((step) => (
            <div
              className={`wizard-step${currentStep === step.id ? ' is-current' : ''}${
                currentStep > step.id ? ' is-complete' : ''
              }`}
              key={step.id}
            >
              <span>{step.id}</span>
              <strong>{step.title}</strong>
            </div>
          ))}
        </div>

        {error ? <div className="feedback-banner error">{error}</div> : null}

        <div className="wizard-body">
          {currentStep === 1 ? (
            <div className="wizard-step-body">
              <label className="field-group">
                <span className="field-label">Customer</span>
                <select
                  className="field-control"
                  onChange={(event) => {
                    updateField('customer_id', event.target.value);
                    updateField('machine_id', '');
                  }}
                  value={formState.customer_id}
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.first_name} {customer.last_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="wizard-step-body">
              <div className="toggle-row">
                <button
                  className={`toggle-chip${formState.machineChoice === 'existing' ? ' is-active' : ''}`}
                  onClick={() => updateField('machineChoice', 'existing')}
                  type="button"
                >
                  Select Existing Machine
                </button>
                <button
                  className={`toggle-chip${formState.machineChoice === 'new' ? ' is-active' : ''}`}
                  onClick={() => updateField('machineChoice', 'new')}
                  type="button"
                >
                  Add New Machine
                </button>
              </div>

              {formState.machineChoice === 'existing' ? (
                <label className="field-group">
                  <span className="field-label">Machine</span>
                  <select
                    className="field-control"
                    onChange={(event) => updateField('machine_id', event.target.value)}
                    value={formState.machine_id}
                  >
                    <option value="">Select a machine</option>
                    {customerMachines.map((machine) => (
                      <option key={machine.machine_id} value={machine.machine_id}>
                        {machine.make} {machine.model_no}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="wizard-field-grid">
                  <label className="field-group">
                    <span className="field-label">Machine type</span>
                    <select
                      className="field-control"
                      onChange={(event) => updateNewMachineField('machine_type_id', event.target.value)}
                      value={formState.newMachine.machine_type_id}
                    >
                      <option value="">Select a type</option>
                      {machineTypes.map((machineType) => (
                        <option
                          key={machineType.machine_type_id}
                          value={machineType.machine_type_id}
                        >
                          {machineType.type_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-group">
                    <span className="field-label">Make</span>
                    <input
                      className="field-control"
                      onChange={(event) => updateNewMachineField('make', event.target.value)}
                      value={formState.newMachine.make}
                    />
                  </label>
                  <label className="field-group">
                    <span className="field-label">Model</span>
                    <input
                      className="field-control"
                      onChange={(event) => updateNewMachineField('model_no', event.target.value)}
                      value={formState.newMachine.model_no}
                    />
                  </label>
                  <label className="field-group">
                    <span className="field-label">Serial</span>
                    <input
                      className="field-control"
                      onChange={(event) => updateNewMachineField('serial_no', event.target.value)}
                      value={formState.newMachine.serial_no}
                    />
                  </label>
                  <label className="field-group">
                    <span className="field-label">Other reference</span>
                    <input
                      className="field-control"
                      onChange={(event) => updateNewMachineField('other_no', event.target.value)}
                      value={formState.newMachine.other_no}
                    />
                  </label>
                </div>
              )}
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="wizard-step-body wizard-field-grid">
              <label className="field-group">
                <span className="field-label">Date logged</span>
                <input
                  className="field-control"
                  onChange={(event) => updateField('date_logged', event.target.value)}
                  type="date"
                  value={formState.date_logged}
                />
              </label>
              <label className="field-group">
                <span className="field-label">Planned return</span>
                <input
                  className="field-control"
                  onChange={(event) => updateField('date_return', event.target.value)}
                  type="date"
                  value={formState.date_return}
                />
              </label>
              <label className="field-group field-span-full">
                <span className="field-label">Initial issue description</span>
                <textarea
                  className="field-control field-textarea"
                  onChange={(event) => updateField('instruction', event.target.value)}
                  value={formState.instruction}
                />
              </label>
              <label className="field-group field-span-full">
                <span className="field-label">Workshop notes</span>
                <textarea
                  className="field-control field-textarea"
                  onChange={(event) => updateField('notes', event.target.value)}
                  value={formState.notes}
                />
              </label>
            </div>
          ) : null}

          {currentStep === 4 ? (
            <div className="wizard-step-body wizard-field-grid">
              <label className="field-group">
                <span className="field-label">Assigned mechanic</span>
                <input
                  className="field-control"
                  onChange={(event) => updateField('assigned_mechanic', event.target.value)}
                  value={formState.assigned_mechanic}
                />
              </label>
              <label className="field-group">
                <span className="field-label">Status</span>
                <select
                  className="field-control"
                  onChange={(event) => updateField('status', event.target.value)}
                  value={formState.status}
                >
                  <option value="Logged">Logged</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Awaiting Parts">Awaiting Parts</option>
                  <option value="Ready for Collection">Ready for Collection</option>
                  <option value="Completed">Completed</option>
                  <option value="Collected">Collected</option>
                </select>
              </label>
              <label className="field-group">
                <span className="field-label">Contact method</span>
                <select
                  className="field-control"
                  onChange={(event) => updateField('contact_method', event.target.value)}
                  value={formState.contact_method}
                >
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                  <option value="Text">Text</option>
                  <option value="In Person">In Person</option>
                </select>
              </label>
              <label className="field-group">
                <span className="field-label">Collected date</span>
                <input
                  className="field-control"
                  onChange={(event) => updateField('date_collected', event.target.value)}
                  type="date"
                  value={formState.date_collected}
                />
              </label>
              <label className="field-group">
                <span className="field-label">Finished date</span>
                <input
                  className="field-control"
                  onChange={(event) => updateField('date_finished', event.target.value)}
                  type="date"
                  value={formState.date_finished}
                />
              </label>
            </div>
          ) : null}
        </div>

        <div className="wizard-actions">
          <button
            className="secondary-button"
            disabled={currentStep === 1}
            onClick={handlePrevious}
            type="button"
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button className="primary-button" onClick={handleNext} type="button">
              Next Step
            </button>
          ) : (
            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? 'Saving...'
                : mode === 'edit'
                  ? 'Save Job'
                  : 'Create Job'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default JobWizard;
