import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import JobDetailPanel from '../components/jobs/JobDetailPanel';
import JobsFilterBar from '../components/jobs/JobsFilterBar';
import JobsTable from '../components/jobs/JobsTable';
import JobWizard from '../components/jobs/JobWizard';
import PageHeader from '../components/navigation/PageHeader';
import { API_BASE_URL } from '../config';


const emptyWorkspace = {
  customers: [],
  invoices: [],
  jobLineItems: [],
  jobParts: [],
  jobs: [],
  machineTypes: [],
  machines: [],
  parts: [],
  services: [],
};

const initialFilters = {
  customerId: '',
  endDate: '',
  startDate: '',
  status: '',
};

const initialInvoiceDraft = {
  date_paid: '',
  payment_type: 'Card',
  total_cost: '',
};

const initialPartDraft = {
  bill_date: new Date().toISOString().slice(0, 10),
  bill_no: '',
  charge_price: '',
  part_id: '',
  quantity: '1',
};

const initialServiceDraft = {
  description: '',
  hourly_rate: '',
  labour_hours: '',
  line_total: '',
  service_id: '',
};

function toNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function calculateTotals(jobLineItems, jobParts) {
  const servicesTotal = jobLineItems.reduce(
    (sum, item) => sum + Number(item.line_total || 0),
    0
  );
  const partsTotal = jobParts.reduce((sum, item) => {
    const price = Number(item.charge_price || 0);
    const quantity = Number(item.quantity || 0) || 0;

    return sum + price * quantity;
  }, 0);

  return {
    grandTotal: servicesTotal + partsTotal,
    partsTotal,
    servicesTotal,
  };
}

function buildRepairJobPayload(job) {
  return {
    assigned_mechanic: job.assigned_mechanic || '',
    contact_method: job.contact_method || '',
    customer_id: job.customer_id,
    date_collected: job.date_collected || '',
    date_finished: job.date_finished || '',
    date_logged: job.date_logged || '',
    date_return: job.date_return || '',
    instruction: job.instruction || '',
    machine_id: job.machine_id,
    notes: job.notes || '',
    status: job.status || '',
  };
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error || payload.errors?.join(', ') || 'The request could not be completed.';
    throw new Error(message);
  }

  return payload;
}

function JobsPage() {
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [invoiceDraft, setInvoiceDraft] = useState(initialInvoiceDraft);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardSubmitting, setIsWizardSubmitting] = useState(false);
  const [partDraft, setPartDraft] = useState(initialPartDraft);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [serviceDraft, setServiceDraft] = useState(initialServiceDraft);
  const [statusDraft, setStatusDraft] = useState('Logged');
  const [wizardState, setWizardState] = useState({
    initialJob: null,
    isOpen: false,
    mode: 'create',
  });
  const [workspace, setWorkspace] = useState(emptyWorkspace);
  const deferredFilters = useDeferredValue(filters);

  async function loadWorkspace(preferredJobId) {
    setIsLoading(true);
    setError('');

    try {
      const [
        jobs,
        customers,
        machines,
        machineTypes,
        services,
        parts,
        jobParts,
        jobLineItems,
        invoices,
      ] = await Promise.all([
        requestJson('/repair-jobs'),
        requestJson('/customers'),
        requestJson('/machines'),
        requestJson('/machine-types'),
        requestJson('/services'),
        requestJson('/parts'),
        requestJson('/job-parts'),
        requestJson('/job-line-items'),
        requestJson('/invoices'),
      ]);

      startTransition(() => {
        setWorkspace({
          customers,
          invoices,
          jobLineItems,
          jobParts,
          jobs,
          machineTypes,
          machines,
          parts,
          services,
        });
        setSelectedJobId((current) => preferredJobId || current || jobs[0]?.job_no || null);
      });
    } catch (loadError) {
      setError(loadError.message || 'Jobs workspace data could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspace();
  }, []);

  const filteredJobs = useMemo(() => {
    return workspace.jobs.filter((job) => {
      const matchesStatus =
        !deferredFilters.status || job.status === deferredFilters.status;
      const matchesCustomer =
        !deferredFilters.customerId ||
        String(job.customer_id) === String(deferredFilters.customerId);
      const matchesStart =
        !deferredFilters.startDate ||
        (job.date_logged && job.date_logged >= deferredFilters.startDate);
      const matchesEnd =
        !deferredFilters.endDate ||
        (job.date_logged && job.date_logged <= deferredFilters.endDate);

      return matchesStatus && matchesCustomer && matchesStart && matchesEnd;
    });
  }, [deferredFilters, workspace.jobs]);

  useEffect(() => {
    if (filteredJobs.length === 0) {
      setSelectedJobId(null);
      return;
    }

    const stillVisible = filteredJobs.some((job) => job.job_no === selectedJobId);

    if (!stillVisible) {
      setSelectedJobId(filteredJobs[0].job_no);
    }
  }, [filteredJobs, selectedJobId]);

  const selectedJob = useMemo(
    () => workspace.jobs.find((job) => job.job_no === selectedJobId) || null,
    [selectedJobId, workspace.jobs]
  );
  const selectedCustomer = useMemo(
    () =>
      workspace.customers.find(
        (customer) => customer.customer_id === selectedJob?.customer_id
      ) || null,
    [selectedJob, workspace.customers]
  );
  const selectedMachine = useMemo(
    () =>
      workspace.machines.find((machine) => machine.machine_id === selectedJob?.machine_id) ||
      null,
    [selectedJob, workspace.machines]
  );
  const selectedJobLineItems = useMemo(
    () =>
      workspace.jobLineItems.filter((lineItem) => lineItem.job_id === selectedJob?.job_no),
    [selectedJob, workspace.jobLineItems]
  );
  const selectedJobParts = useMemo(
    () => workspace.jobParts.filter((jobPart) => jobPart.job_no === selectedJob?.job_no),
    [selectedJob, workspace.jobParts]
  );
  const selectedInvoices = useMemo(
    () => workspace.invoices.filter((invoice) => invoice.job_no === selectedJob?.job_no),
    [selectedJob, workspace.invoices]
  );
  const selectedMachineServices = useMemo(() => {
    if (!selectedMachine?.machine_type_id) {
      return workspace.services;
    }

    return workspace.services.filter(
      (service) => service.machine_type_id === selectedMachine.machine_type_id
    );
  }, [selectedMachine, workspace.services]);
  const totals = useMemo(
    () => calculateTotals(selectedJobLineItems, selectedJobParts),
    [selectedJobLineItems, selectedJobParts]
  );
  const statusOptions = useMemo(
    () =>
      [...new Set(workspace.jobs.map((job) => job.status).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [workspace.jobs]
  );

  useEffect(() => {
    if (!selectedJobId) {
      return;
    }

    setStatusDraft(selectedJob?.status || 'Logged');
    setActionError('');
    setActionMessage('');
    setPartDraft((current) => ({
      ...initialPartDraft,
      bill_date: current.bill_date || initialPartDraft.bill_date,
    }));
    setServiceDraft(initialServiceDraft);
    setInvoiceDraft({
      date_paid: '',
      payment_type: 'Card',
      total_cost: totals.grandTotal ? totals.grandTotal.toFixed(2) : '0.00',
    });
  }, [selectedJob?.status, selectedJobId, totals.grandTotal]);

  function openWizard(mode, initialJob = null) {
    setWizardState({
      initialJob,
      isOpen: true,
      mode,
    });
  }

  function closeWizard() {
    setWizardState((current) => ({
      ...current,
      isOpen: false,
    }));
  }

  async function handleJobWizardSubmit(formState) {
    setIsWizardSubmitting(true);
    setActionError('');

    try {
      let machineId = Number(formState.machine_id);

      if (formState.machineChoice === 'new') {
        const machinePayload = {
          customer_id: Number(formState.customer_id),
          machine_type_id: Number(formState.newMachine.machine_type_id),
          make: formState.newMachine.make,
          model_no: formState.newMachine.model_no,
          other_no: formState.newMachine.other_no,
          serial_no: formState.newMachine.serial_no,
        };

        const machineResult = await requestJson('/machines', {
          body: JSON.stringify(machinePayload),
          method: 'POST',
        });

        machineId = machineResult.machine_id;
      }

      const repairJobPayload = {
        assigned_mechanic: formState.assigned_mechanic,
        contact_method: formState.contact_method,
        customer_id: Number(formState.customer_id),
        date_collected: formState.date_collected,
        date_finished: formState.date_finished,
        date_logged: formState.date_logged,
        date_return: formState.date_return,
        instruction: formState.instruction,
        machine_id: machineId,
        notes: formState.notes,
        status: formState.status,
      };

      let jobNo = wizardState.initialJob?.job_no;

      if (wizardState.mode === 'edit' && wizardState.initialJob) {
        await requestJson(`/repair-jobs/${wizardState.initialJob.job_no}`, {
          body: JSON.stringify(repairJobPayload),
          method: 'PUT',
        });
      } else {
        const result = await requestJson('/repair-jobs', {
          body: JSON.stringify(repairJobPayload),
          method: 'POST',
        });

        jobNo = result.job_no;
      }

      setActionMessage(
        wizardState.mode === 'edit'
          ? 'Repair job updated successfully.'
          : 'Repair job created successfully.'
      );
      closeWizard();
      await loadWorkspace(jobNo);
    } catch (submitError) {
      setActionError(submitError.message || 'The repair job could not be saved.');
    } finally {
      setIsWizardSubmitting(false);
    }
  }

  async function handleStatusSave() {
    if (!selectedJob) {
      return;
    }

    setBusyAction('status');
    setActionError('');

    try {
      await requestJson(`/repair-jobs/${selectedJob.job_no}`, {
        body: JSON.stringify(
          buildRepairJobPayload({
            ...selectedJob,
            status: statusDraft,
          })
        ),
        method: 'PUT',
      });
      setActionMessage('Job status updated successfully.');
      await loadWorkspace(selectedJob.job_no);
    } catch (saveError) {
      setActionError(saveError.message || 'The job status could not be updated.');
    } finally {
      setBusyAction('');
    }
  }

  async function handleAddPart() {
    if (!selectedJob) {
      return;
    }

    setBusyAction('part');
    setActionError('');

    try {
      const selectedPart = workspace.parts.find(
        (part) => String(part.part_id) === String(partDraft.part_id)
      );

      await requestJson('/job-parts', {
        body: JSON.stringify({
          bill_date: partDraft.bill_date,
          bill_no: partDraft.bill_no,
          charge_price:
            toNumber(partDraft.charge_price) ?? Number(selectedPart?.retail_price || 0),
          job_no: selectedJob.job_no,
          part_id: Number(partDraft.part_id),
          quantity: Number(partDraft.quantity),
        }),
        method: 'POST',
      });

      setActionMessage('Part linked to repair job successfully.');
      setPartDraft((current) => ({
        ...initialPartDraft,
        bill_date: current.bill_date || initialPartDraft.bill_date,
      }));
      await loadWorkspace(selectedJob.job_no);
    } catch (partError) {
      setActionError(partError.message || 'The part could not be added to the job.');
    } finally {
      setBusyAction('');
    }
  }

  async function handleAddService() {
    if (!selectedJob) {
      return;
    }

    setBusyAction('service');
    setActionError('');

    try {
      const selectedService = workspace.services.find(
        (service) => String(service.service_id) === String(serviceDraft.service_id)
      );
      const labourHours = toNumber(serviceDraft.labour_hours);
      const hourlyRate = toNumber(serviceDraft.hourly_rate);
      const derivedTotal =
        toNumber(serviceDraft.line_total) ??
        (labourHours !== null && hourlyRate !== null ? labourHours * hourlyRate : null) ??
        Number(selectedService?.price || 0);

      await requestJson('/job-line-items', {
        body: JSON.stringify({
          description:
            serviceDraft.description || selectedService?.service_description || '',
          hourly_rate: hourlyRate,
          job_id: selectedJob.job_no,
          labour_hours: labourHours,
          line_total: derivedTotal,
          service_id: toNumber(serviceDraft.service_id),
        }),
        method: 'POST',
      });

      setActionMessage('Service line added to repair job successfully.');
      setServiceDraft(initialServiceDraft);
      await loadWorkspace(selectedJob.job_no);
    } catch (serviceError) {
      setActionError(
        serviceError.message || 'The service line could not be added to the job.'
      );
    } finally {
      setBusyAction('');
    }
  }

  async function handleGenerateInvoice() {
    if (!selectedJob) {
      return;
    }

    setBusyAction('invoice');
    setActionError('');

    try {
      await requestJson('/invoices', {
        body: JSON.stringify({
          customer_id: selectedJob.customer_id,
          date_paid: invoiceDraft.date_paid,
          job_no: selectedJob.job_no,
          payment_type: invoiceDraft.payment_type,
          sale_item_no: null,
          total_cost: toNumber(invoiceDraft.total_cost) ?? totals.grandTotal,
        }),
        method: 'POST',
      });
      setActionMessage('Invoice generated successfully.');
      await loadWorkspace(selectedJob.job_no);
    } catch (invoiceError) {
      setActionError(invoiceError.message || 'The invoice could not be created.');
    } finally {
      setBusyAction('');
    }
  }

  if (isLoading) {
    return (
      <div className="jobs-page">
        <PageHeader
          eyebrow="Core Workflow"
          summary="Loading the repair queue, workshop actions, and linked billing data."
          title="Jobs"
        />
        <section className="surface-card">
          <p className="section-copy">Loading the jobs workspace...</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jobs-page">
        <PageHeader
          eyebrow="Core Workflow"
          summary="The jobs workspace depends on repair jobs, parts, services, and invoice data being available."
          title="Jobs"
        />
        <section className="surface-card">
          <div className="feedback-banner error">{error}</div>
        </section>
      </div>
    );
  }

  return (
    <div className="jobs-page">
      <PageHeader
        eyebrow="Core Workflow"
        summary="This is the operational hub for repair intake, workshop progress, labour lines, parts usage, and invoice generation."
        title="Jobs"
      />

      <div className="jobs-workspace">
        <div className="jobs-primary-column">
          <JobsFilterBar
            customers={workspace.customers}
            filters={filters}
            onChange={(field, value) =>
              setFilters((current) => ({
                ...current,
                [field]: value,
              }))
            }
            onCreateJob={() => openWizard('create')}
            onReset={() => setFilters(initialFilters)}
            statuses={statusOptions}
          />
          <JobsTable
            jobs={filteredJobs}
            onSelect={setSelectedJobId}
            selectedJobId={selectedJobId}
          />
        </div>

        <JobDetailPanel
          actionError={actionError}
          actionMessage={actionMessage}
          busyAction={busyAction}
          customer={selectedCustomer}
          invoiceDraft={invoiceDraft}
          invoices={selectedInvoices}
          job={selectedJob}
          jobLineItems={selectedJobLineItems}
          jobParts={selectedJobParts}
          machine={selectedMachine}
          onAddPart={handleAddPart}
          onAddService={handleAddService}
          onEditJob={() => openWizard('edit', selectedJob)}
          onGenerateInvoice={handleGenerateInvoice}
          onInvoiceDraftChange={(field, value) =>
            setInvoiceDraft((current) => ({
              ...current,
              [field]: value,
            }))
          }
          onPartDraftChange={(field, value) =>
            setPartDraft((current) => ({
              ...current,
              [field]: value,
            }))
          }
          onSaveStatus={handleStatusSave}
          onServiceDraftChange={(field, value) =>
            setServiceDraft((current) => ({
              ...current,
              [field]: value,
            }))
          }
          onStatusDraftChange={setStatusDraft}
          partDraft={partDraft}
          parts={workspace.parts}
          serviceDraft={serviceDraft}
          services={selectedMachineServices}
          statusDraft={statusDraft}
          totals={totals}
        />
      </div>

      <JobWizard
        customers={workspace.customers}
        initialJob={wizardState.initialJob}
        isOpen={wizardState.isOpen}
        isSubmitting={isWizardSubmitting}
        machineTypes={workspace.machineTypes}
        machines={workspace.machines}
        mode={wizardState.mode}
        onClose={closeWizard}
        onSubmit={handleJobWizardSubmit}
      />
    </div>
  );
}

export default JobsPage;
