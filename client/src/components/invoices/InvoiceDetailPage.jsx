import { useEffect, useState } from 'react';
import { fetchJson } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

function InvoiceDetailPage({ invoiceId, onClose, onEdit }) {
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInvoice() {
      setIsLoading(true);
      setError('');

      try {
        const data = await fetchJson(`/invoices/${invoiceId}`);
        setInvoice(data);
      } catch (loadError) {
        setError(loadError.message || 'Invoice could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  if (!invoiceId) {
    return null;
  }

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true">
      <button aria-label="Close invoice details" className="detail-backdrop" onClick={onClose} type="button" />
      <section className="detail-panel">
        <div className="detail-header">
          <div>
            <span className="section-label">Invoice Record</span>
            <h3 className="form-title">Invoice #{invoiceId}</h3>
          </div>
          <button aria-label="Close details" className="close-button" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading invoice...</div>
        ) : error ? (
          <div className="feedback-banner error">{error}</div>
        ) : (
          invoice && (
            <div className="detail-body">
              <section className="detail-section surface-card">
                <div className="section-label">Customer</div>
                <div className="detail-rows">
                  <div className="detail-row">
                    <span className="label">Name</span>
                    <span className="value">
                      {invoice.customer_first_name} {invoice.customer_last_name}
                    </span>
                  </div>
                </div>
              </section>

              <section className="detail-section surface-card">
                <div className="section-label">Invoice Summary</div>
                <div className="detail-rows">
                  <div className="detail-row">
                    <span className="label">Amount</span>
                    <span className="value">{formatCurrency(invoice.total_cost)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Payment type</span>
                    <span className="value">{invoice.payment_type || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Date paid</span>
                    <span className="value">
                      {invoice.date_paid ? formatDate(invoice.date_paid) : 'Pending'}
                    </span>
                  </div>
                </div>
              </section>

              <section className="detail-section surface-card">
                <div className="section-label">Reference</div>
                <div className="detail-rows">
                  <div className="detail-row">
                    <span className="label">Repair job</span>
                    <span className="value">
                      {invoice.job_no
                        ? `#${invoice.job_no} (${invoice.repair_job_status || 'Unknown'})`
                        : 'None'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Sale items</span>
                    <span className="value">
                      {invoice.sale_items?.length
                        ? invoice.sale_items
                            .map((item) => {
                              const label =
                                item.details ||
                                [item.make, item.model].filter(Boolean).join(' ') ||
                                `#${item.sale_item_no}`;

                              return item.quantity > 1 ? `${label} x${item.quantity}` : label;
                            })
                            .join(', ')
                        : 'None'}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )
        )}

        <div className="form-footer">
          <button className="secondary-button" onClick={onClose} type="button">
            Close
          </button>
          <button
            className="primary-button"
            onClick={() => {
              onClose();
              onEdit(invoiceId);
            }}
            type="button"
          >
            Edit Invoice
          </button>
        </div>
      </section>
    </div>
  );
}

export default InvoiceDetailPage;
