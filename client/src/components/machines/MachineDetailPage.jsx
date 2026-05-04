import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../config';


async function requestJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error || 'The request could not be completed.';
    throw new Error(message);
  }

  return payload;
}

function formatDate(value) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-GB', {
    currency: 'GBP',
    style: 'currency',
  }).format(Number(value || 0));
}

function MachineDetailPage({
  machineId,
  onClose,
  onEdit,
}) {
  const [machine, setMachine] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobParts, setJobParts] = useState([]);
  const [parts, setParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError('');

      try {
        const [machineData, allJobs, allJobParts, allParts] = await Promise.all([
          requestJson(`/machines/${machineId}`),
          requestJson('/repair-jobs'),
          requestJson('/job-parts'),
          requestJson('/parts'),
        ]);

        setMachine(machineData);

        // Filter jobs for this machine
        const machineJobs = allJobs.filter(
          (j) => String(j.machine_id) === String(machineId)
        );
        setJobs(machineJobs);

        // Filter job parts for this machine's jobs
        const machineJobIds = machineJobs.map(j => j.job_no);
        const machineJobParts = allJobParts.filter(
          (jp) => machineJobIds.includes(jp.job_no)
        );
        setJobParts(machineJobParts);

        setParts(allParts);
      } catch (loadError) {
        setError(loadError.message || 'Could not load machine details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [machineId]);

  const statistics = useMemo(() => {
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter((j) => j.status === 'Completed').length;
    const totalPartsUsed = jobParts.reduce((sum, jp) => sum + Number(jp.quantity || 0), 0);
    
    // Calculate total parts cost
    const totalPartsCost = jobParts.reduce((sum, jp) => {
      const part = parts.find(p => p.part_id === jp.part_id);
      const price = part ? Number(part.cost_price || 0) : 0;
      const quantity = Number(jp.quantity || 0);
      return sum + (price * quantity);
    }, 0);

    return { totalJobs, completedJobs, totalPartsUsed, totalPartsCost };
  }, [jobs, jobParts, parts]);

  // Get parts usage summary
  const partsUsage = useMemo(() => {
    const usage = {};
    
    jobParts.forEach((jp) => {
      const part = parts.find(p => p.part_id === jp.part_id);
      if (part) {
        if (!usage[part.part_id]) {
          usage[part.part_id] = {
            part_name: part.part_name,
            total_quantity: 0,
            total_cost: 0,
            cost_price: Number(part.cost_price || 0),
          };
        }
        usage[part.part_id].total_quantity += Number(jp.quantity || 0);
        usage[part.part_id].total_cost += Number(jp.quantity || 0) * Number(part.cost_price || 0);
      }
    });

    return Object.values(usage).sort((a, b) => b.total_quantity - a.total_quantity);
  }, [jobParts, parts]);

  if (isLoading) {
    return (
      <div className="detail-overlay" role="dialog" aria-modal="true">
        <button
          aria-label="Close machine detail"
          className="detail-backdrop"
          onClick={onClose}
          type="button"
        />
        <div className="detail-panel">
          <div className="detail-loading">Loading machine details...</div>
        </div>
      </div>
    );
  }

  if (error || !machine) {
    return (
      <div className="detail-overlay" role="dialog" aria-modal="true">
        <button
          aria-label="Close machine detail"
          className="detail-backdrop"
          onClick={onClose}
          type="button"
        />
        <div className="detail-panel">
          <div className="feedback-banner error">{error || 'Machine not found.'}</div>
          <button className="secondary-button" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true">
      <button
        aria-label="Close machine detail"
        className="detail-backdrop"
        onClick={onClose}
        type="button"
      />

      <div className="detail-panel detail-large">
        <div className="detail-header">
          <div>
            <span className="section-label">Equipment Profile</span>
            <h2 className="section-title">
              {machine.make} {machine.model_no}
            </h2>
            <p className="section-copy">
              {machine.machine_type_name} • Owned by {machine.customer_first_name} {machine.customer_last_name}
            </p>
          </div>

          <div className="detail-actions">
            <button
              className="secondary-button"
              onClick={() => onEdit(machine.machine_id)}
              type="button"
            >
              Edit
            </button>
            <button
              className="secondary-button"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </div>

        <div className="detail-body">
          {/* Machine Info & Statistics */}
          <div className="detail-grid">
            <section className="detail-section surface-card">
              <div className="section-label">Machine Details</div>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="label">Type</span>
                  <span className="value">{machine.machine_type_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Make</span>
                  <span className="value">{machine.make}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Model</span>
                  <span className="value">{machine.model_no}</span>
                </div>
                {machine.serial_no && (
                  <div className="detail-row">
                    <span className="label">Serial</span>
                    <span className="value">{machine.serial_no}</span>
                  </div>
                )}
                {machine.other_no && (
                  <div className="detail-row">
                    <span className="label">Other ID</span>
                    <span className="value">{machine.other_no}</span>
                  </div>
                )}
              </div>
            </section>

            <section className="detail-section surface-card">
              <div className="section-label">Service History</div>
              <div className="stat-grid">
                <div className="stat-item">
                  <div className="stat-value">{statistics.totalJobs}</div>
                  <div className="stat-label">Total Jobs</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{statistics.completedJobs}</div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{statistics.totalPartsUsed}</div>
                  <div className="stat-label">Parts Used</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formatCurrency(statistics.totalPartsCost)}</div>
                  <div className="stat-label">Parts Cost</div>
                </div>
              </div>
            </section>
          </div>

          {/* Repair History */}
          <section className="detail-section surface-card">
            <div className="section-label">Repair History</div>
            {jobs.length === 0 ? (
              <div className="empty-state">
                <strong>No repair jobs yet.</strong>
                <span>Create a job to track maintenance work.</span>
              </div>
            ) : (
              <div className="job-list">
                {jobs.map((job) => (
                  <div className="job-item" key={job.job_no}>
                    <div className="job-header">
                      <div className="job-id">#{job.job_no}</div>
                      <span className="status-chip">{job.status}</span>
                    </div>
                    <div className="job-details">
                      <span>{job.instruction}</span>
                      <span>{formatDate(job.date_logged)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Parts Used Over Time */}
          <section className="detail-section surface-card">
            <div className="section-label">Parts Used Over Time</div>
            {partsUsage.length === 0 ? (
              <div className="empty-state">
                <strong>No parts used yet.</strong>
                <span>Parts will appear after jobs are completed.</span>
              </div>
            ) : (
              <div className="parts-usage-list">
                {partsUsage.map((usage) => (
                  <div className="parts-usage-item" key={usage.part_name}>
                    <div className="parts-usage-header">
                      <div className="part-name">{usage.part_name}</div>
                      <div className="usage-stats">
                        <span>{usage.total_quantity} used</span>
                        <span>{formatCurrency(usage.total_cost)}</span>
                      </div>
                    </div>
                    <div className="parts-usage-details">
                      <span>Cost per unit: {formatCurrency(usage.cost_price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default MachineDetailPage;
