import { useEffect, useMemo, useState } from 'react';
import { fetchJson } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

function renderAddress(customer) {
  return [
    customer?.address_line_1,
    customer?.address_line_2,
    customer?.address_line_3,
    customer?.postcode,
  ]
    .filter(Boolean)
    .join(', ');
}

function CustomerDetailPage({
  customerId,
  onClose,
  onEdit,
}) {
  const [customer, setCustomer] = useState(null);
  const [machines, setMachines] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError('');

      try {
        const [customerData, allMachines, allJobs, allInvoices] = await Promise.all([
          fetchJson(`/customers/${customerId}`),
          fetchJson('/machines'),
          fetchJson('/repair-jobs'),
          fetchJson('/invoices'),
        ]);

        setCustomer(customerData);

        // Filter machines owned by this customer
        const customerMachines = allMachines.filter(
          (m) => String(m.customer_id) === String(customerId)
        );
        setMachines(customerMachines);

        // Filter jobs for this customer
        const customerJobs = allJobs.filter(
          (j) => String(j.customer_id) === String(customerId)
        );
        setJobs(customerJobs);

        // Filter invoices for this customer
        const customerInvoices = allInvoices.filter(
          (i) => String(i.customer_id) === String(customerId)
        );
        setInvoices(customerInvoices);
      } catch (loadError) {
        setError(loadError.message || 'Could not load customer details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [customerId]);

  const statistics = useMemo(() => {
    const totalSpend = invoices.reduce((sum, inv) => sum + Number(inv.total_cost || 0), 0);
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter((j) => j.status === 'Completed').length;

    return { totalSpend, totalJobs, completedJobs };
  }, [jobs, invoices]);

  if (isLoading) {
    return (
      <div className="detail-overlay" role="dialog" aria-modal="true">
        <button
          aria-label="Close customer detail"
          className="detail-backdrop"
          onClick={onClose}
          type="button"
        />
        <div className="detail-panel">
          <div className="detail-loading">Loading customer details...</div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="detail-overlay" role="dialog" aria-modal="true">
        <button
          aria-label="Close customer detail"
          className="detail-backdrop"
          onClick={onClose}
          type="button"
        />
        <div className="detail-panel">
          <div className="feedback-banner error">{error || 'Customer not found.'}</div>
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
        aria-label="Close customer detail"
        className="detail-backdrop"
        onClick={onClose}
        type="button"
      />

      <div className="detail-panel detail-large">
        <div className="detail-header">
          <div>
            <span className="section-label">Customer Profile</span>
            <h2 className="section-title">
              {customer.first_name} {customer.last_name}
            </h2>
            <p className="section-copy">{renderAddress(customer)}</p>
          </div>

          <div className="detail-actions">
            <button
              className="secondary-button"
              onClick={() => onEdit(customer.customer_id)}
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
          {/* Contact & Statistics */}
          <div className="detail-grid">
            <section className="detail-section surface-card">
              <div className="section-label">Contact Information</div>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="label">Phone</span>
                  <span className="value">{customer.phone_number || 'Not provided'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Address</span>
                  <span className="value">{renderAddress(customer)}</span>
                </div>
              </div>
            </section>

            <section className="detail-section surface-card">
              <div className="section-label">At a Glance</div>
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
                  <div className="stat-value">{machines.length}</div>
                  <div className="stat-label">Machines Owned</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formatCurrency(statistics.totalSpend)}</div>
                  <div className="stat-label">Lifetime Spend</div>
                </div>
              </div>
            </section>
          </div>

          {/* Machines Owned */}
          <section className="detail-section surface-card">
            <div className="section-label">Equipment Owned</div>
            {machines.length === 0 ? (
              <div className="empty-state">
                <strong>No machines yet.</strong>
                <span>Add a machine when creating the first job.</span>
              </div>
            ) : (
              <div className="detail-rows">
                {machines.map((machine) => (
                  <div className="detail-row" key={machine.machine_id}>
                    <span className="label">
                      {machine.make} {machine.model_no}
                    </span>
                    <span className="value">{machine.serial_no || 'Serial: not set'}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Job History */}
          <section className="detail-section surface-card">
            <div className="section-label">Job History</div>
            {jobs.length === 0 ? (
              <div className="empty-state">
                <strong>No jobs on record.</strong>
                <span>Create a repair job to track work.</span>
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
                      <span>{job.machine_make} {job.machine_model_no}</span>
                      <span>{formatDate(job.date_logged)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Invoices */}
          <section className="detail-section surface-card">
            <div className="section-label">Billing History</div>
            {invoices.length === 0 ? (
              <div className="empty-state">
                <strong>No invoices yet.</strong>
                <span>Invoices will appear after jobs are completed.</span>
              </div>
            ) : (
              <div className="invoice-list">
                {invoices.map((invoice) => (
                  <div className="invoice-item" key={invoice.invoice_no}>
                    <div className="invoice-header">
                      <div className="invoice-id">Invoice #{invoice.invoice_no}</div>
                      <span className="payment-status">{invoice.date_paid ? 'Paid' : 'Unpaid'}</span>
                    </div>
                    <div className="invoice-details">
                      <span>{invoice.date_paid ? formatDate(invoice.date_paid) : 'Pending'}</span>
                      <span>{formatCurrency(invoice.total_cost)}</span>
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

export default CustomerDetailPage;
