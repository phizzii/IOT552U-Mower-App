import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';


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

function InvoiceDetailPage({ invoiceId, onClose, onEdit }) {
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInvoice() {
      setIsLoading(true);
      setError('');

      try {
        const data = await requestJson(`/invoices/${invoiceId}`);
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
    <div className="form-overlay" role="dialog" aria-modal="true">
      <button aria-label="Close invoice details" className="form-backdrop" onClick={onClose} type="button" />
      <section className="form-panel detail-panel">
        <div className="form-header">
          <div>
            <h3 className="form-title">Invoice #{invoiceId}</h3>
            <p className="section-copy">A detailed view of the billing record, customer reference, and payment status.</p>
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
              <div className="detail-section">
                <h4 className="section-title">Customer</h4>
                <p>{invoice.customer_first_name} {invoice.customer_last_name}</p>
              </div>

              <div className="detail-section">
                <h4 className="section-title">Invoice Summary</h4>
                <div className="detail-row">
                  <span>Amount</span>
                  <span>£{Number(invoice.total_cost).toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span>Payment type</span>
                  <span>{invoice.payment_type || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span>Date paid</span>
                  <span>{invoice.date_paid || 'Pending'}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4 className="section-title">Reference</h4>
                <div className="detail-row">
                  <span>Repair job</span>
                  <span>{invoice.job_no ? `#${invoice.job_no} (${invoice.repair_job_status || 'Unknown'})` : 'None'}</span>
                </div>
                <div className="detail-row">
                  <span>Sale item</span>
                  <span>{invoice.sale_item_no ? `#${invoice.sale_item_no} (${invoice.sale_item_details || 'Details unavailable'})` : 'None'}</span>
                </div>
              </div>
            </div>
          )
        )}

        <div className="form-footer">
          <button className="secondary-button" onClick={onClose} type="button">
            Close
          </button>
          <button
            className="primary-button"
            onClick={() => onEdit(invoiceId)}
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
