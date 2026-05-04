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

function JobDetailPanel({
  actionError,
  actionMessage,
  busyAction,
  customer,
  invoiceDraft,
  invoices,
  job,
  jobLineItems,
  jobParts,
  machine,
  onAddPart,
  onAddService,
  onEditJob,
  onGenerateInvoice,
  onInvoiceDraftChange,
  onPartDraftChange,
  onSaveStatus,
  onServiceDraftChange,
  onStatusDraftChange,
  partDraft,
  parts,
  serviceDraft,
  services,
  statusDraft,
  totals,
}) {
  if (!job) {
    return (
      <section className="surface-card job-detail-card" data-reveal="job-empty">
        <span className="section-label">Job Detail</span>
        <h2 className="section-title jobs-panel-title">Select a repair job</h2>
      </section>
    );
  }

  return (
    <section className="job-detail-column">
      <div className="job-subgrid">
        <section className="surface-card detail-block-card" data-reveal="job-parts">
          <div className="job-subsection-header">
            <div>
              <span className="section-label">Parts Used</span>
              <h3 className="jobs-panel-subtitle">Linked Parts</h3>
            </div>
            <span className="jobs-table-count">{jobParts.length} items</span>
          </div>

          <div className="stack-list">
            {jobParts.length === 0 ? (
              <span className="muted-copy">No parts have been added to this job yet.</span>
            ) : (
              jobParts.map((jobPart) => (
                <div className="line-item-row" key={jobPart.job_part_id}>
                  <strong>{jobPart.part_description || 'Part'}</strong>
                  <span>
                    Qty {jobPart.quantity} · {formatCurrency(jobPart.charge_price)}
                  </span>
                </div>
              ))
            )}
          </div>

          <form
            className="inline-form parts-form"
            onSubmit={(event) => {
              event.preventDefault();
              onAddPart();
            }}
          >
            <label className="field-group">
              <span className="field-label">Part</span>
              <select
                className="field-control"
                onChange={(event) => onPartDraftChange('part_id', event.target.value)}
                value={partDraft.part_id}
              >
                <option value="">Select a part</option>
                {parts.map((part) => (
                  <option key={part.part_id} value={part.part_id}>
                    {part.part_description}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group narrow">
              <span className="field-label">Qty</span>
              <input
                className="field-control"
                min="1"
                onChange={(event) => onPartDraftChange('quantity', event.target.value)}
                type="number"
                value={partDraft.quantity}
              />
            </label>
            <label className="field-group narrow">
              <span className="field-label">Charge</span>
              <input
                className="field-control"
                min="0"
                onChange={(event) => onPartDraftChange('charge_price', event.target.value)}
                step="0.01"
                type="number"
                value={partDraft.charge_price}
              />
            </label>
            <button
              className="secondary-button"
              disabled={busyAction === 'part'}
              type="submit"
            >
              {busyAction === 'part' ? 'Adding...' : 'Add Part'}
            </button>
          </form>
        </section>

        <section className="surface-card detail-block-card" data-reveal="job-services">
          <div className="job-subsection-header">
            <div>
              <span className="section-label">Services Applied</span>
              <h3 className="jobs-panel-subtitle">Labour & Service Lines</h3>
            </div>
            <span className="jobs-table-count">{jobLineItems.length} items</span>
          </div>

          <div className="stack-list">
            {jobLineItems.length === 0 ? (
              <span className="muted-copy">No service lines have been added to this job yet.</span>
            ) : (
              jobLineItems.map((lineItem) => (
                <div className="line-item-row" key={lineItem.line_item_id}>
                  <strong>{lineItem.service_description || lineItem.description || 'Custom labour'}</strong>
                  <span>{formatCurrency(lineItem.line_total)}</span>
                </div>
              ))
            )}
          </div>

          <form
            className="inline-form service-form"
            onSubmit={(event) => {
              event.preventDefault();
              onAddService();
            }}
          >
            <label className="field-group field-span-2">
              <span className="field-label">Service</span>
              <select
                className="field-control"
                onChange={(event) => onServiceDraftChange('service_id', event.target.value)}
                value={serviceDraft.service_id}
              >
                <option value="">Custom labour only</option>
                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.service_description}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group field-span-2">
              <span className="field-label">Description</span>
              <input
                className="field-control"
                onChange={(event) => onServiceDraftChange('description', event.target.value)}
                placeholder="Describe the labour or selected service"
                value={serviceDraft.description}
              />
            </label>
            <label className="field-group narrow">
              <span className="field-label">Hours</span>
              <input
                className="field-control"
                min="0"
                onChange={(event) => onServiceDraftChange('labour_hours', event.target.value)}
                step="0.25"
                type="number"
                value={serviceDraft.labour_hours}
              />
            </label>
            <label className="field-group narrow">
              <span className="field-label">Rate</span>
              <input
                className="field-control"
                min="0"
                onChange={(event) => onServiceDraftChange('hourly_rate', event.target.value)}
                step="0.01"
                type="number"
                value={serviceDraft.hourly_rate}
              />
            </label>
            <label className="field-group narrow">
              <span className="field-label">Line total</span>
              <input
                className="field-control"
                min="0"
                onChange={(event) => onServiceDraftChange('line_total', event.target.value)}
                step="0.01"
                type="number"
                value={serviceDraft.line_total}
              />
            </label>
            <button
              className="secondary-button"
              disabled={busyAction === 'service'}
              type="submit"
            >
              {busyAction === 'service' ? 'Adding...' : 'Add Service'}
            </button>
          </form>
        </section>
      </div>

      <section className="surface-card job-detail-card" data-reveal="job-summary">
        <div className="job-detail-header">
          <div>
            <span className="section-label">Repair Job Record</span>
            <h2 className="section-title jobs-panel-title">Repair Job #{job.job_no}</h2>
          </div>

          <button className="secondary-button" onClick={onEditJob} type="button">
            Edit Intake
          </button>
        </div>

        {actionMessage ? <div className="feedback-banner success">{actionMessage}</div> : null}
        {actionError ? <div className="feedback-banner error">{actionError}</div> : null}

        <div className="job-detail-grid">
          <article className="detail-block">
            <h3>Job Info</h3>
            <dl className="detail-list">
              <div>
                <dt>Status</dt>
                <dd>{job.status || 'Unspecified'}</dd>
              </div>
              <div>
                <dt>Assigned mechanic</dt>
                <dd>{job.assigned_mechanic || 'Unassigned'}</dd>
              </div>
              <div>
                <dt>Logged</dt>
                <dd>{formatDate(job.date_logged)}</dd>
              </div>
              <div>
                <dt>Planned return</dt>
                <dd>{formatDate(job.date_return)}</dd>
              </div>
              <div>
                <dt>Contact method</dt>
                <dd>{job.contact_method || 'Not set'}</dd>
              </div>
              <div>
                <dt>Notes</dt>
                <dd>{job.notes || 'No notes recorded yet.'}</dd>
              </div>
            </dl>
            <div className="status-update-row">
              <select
                className="field-control"
                onChange={(event) => onStatusDraftChange(event.target.value)}
                value={statusDraft}
              >
                <option value="Logged">Logged</option>
                <option value="In Progress">In Progress</option>
                <option value="Awaiting Parts">Awaiting Parts</option>
                <option value="Ready for Collection">Ready for Collection</option>
                <option value="Completed">Completed</option>
                <option value="Collected">Collected</option>
              </select>
              <button
                className="primary-button"
                disabled={busyAction === 'status'}
                onClick={onSaveStatus}
                type="button"
              >
                {busyAction === 'status' ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </article>

          <article className="detail-block">
            <h3>Customer Info</h3>
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown customer'}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{customer?.phone_number || 'Not set'}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{customer ? renderAddress(customer) : 'No address available'}</dd>
              </div>
            </dl>
          </article>

          <article className="detail-block">
            <h3>Machine Info</h3>
            <dl className="detail-list">
              <div>
                <dt>Make</dt>
                <dd>{machine?.make || job.machine_make || 'Unknown'}</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd>{machine?.model_no || job.machine_model_no || 'Unknown'}</dd>
              </div>
              <div>
                <dt>Serial</dt>
                <dd>{machine?.serial_no || job.machine_serial_no || 'Not set'}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{machine?.machine_type_name || 'Not linked yet'}</dd>
              </div>
            </dl>
          </article>

          <article className="detail-block">
            <h3>Invoice Summary</h3>
            <div className="summary-metric-row">
              <div className="metric-chip compact">
                <strong>{formatCurrency(totals.partsTotal)}</strong>
                <span>Parts total</span>
              </div>
              <div className="metric-chip compact">
                <strong>{formatCurrency(totals.servicesTotal)}</strong>
                <span>Labour total</span>
              </div>
              <div className="metric-chip compact">
                <strong>{formatCurrency(totals.grandTotal)}</strong>
                <span>Suggested invoice</span>
              </div>
            </div>

            <div className="invoice-list">
              {invoices.length === 0 ? (
                <span className="muted-copy">No invoice has been created for this job yet.</span>
              ) : (
                invoices.map((invoice) => (
                  <div className="line-item-row" key={invoice.invoice_no}>
                    <strong>Invoice #{invoice.invoice_no}</strong>
                    <span>
                      {formatCurrency(invoice.total_cost)} · {invoice.date_paid ? 'Paid' : 'Awaiting payment'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <form
              className="inline-form"
              onSubmit={(event) => {
                event.preventDefault();
                onGenerateInvoice();
              }}
            >
              <label className="field-group">
                <span className="field-label">Payment type</span>
                <input
                  className="field-control"
                  onChange={(event) => onInvoiceDraftChange('payment_type', event.target.value)}
                  value={invoiceDraft.payment_type}
                />
              </label>
              <label className="field-group">
                <span className="field-label">Paid date</span>
                <input
                  className="field-control"
                  onChange={(event) => onInvoiceDraftChange('date_paid', event.target.value)}
                  type="date"
                  value={invoiceDraft.date_paid}
                />
              </label>
              <label className="field-group">
                <span className="field-label">Invoice total</span>
                <input
                  className="field-control"
                  min="0"
                  onChange={(event) => onInvoiceDraftChange('total_cost', event.target.value)}
                  step="0.01"
                  type="number"
                  value={invoiceDraft.total_cost}
                />
              </label>
              <button
                className="primary-button"
                disabled={busyAction === 'invoice'}
                type="submit"
              >
                {busyAction === 'invoice' ? 'Generating...' : 'Generate Invoice'}
              </button>
            </form>
          </article>
        </div>
      </section>
    </section>
  );
}

export default JobDetailPanel;
