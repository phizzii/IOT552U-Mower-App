import { useMemo } from 'react';

function InvoicesList({ invoices, onDelete, onEdit, onView }) {
  const filteredInvoices = useMemo(() => invoices, [invoices]);

  return (
    <div className="invoices-list-card surface-card">
      <div className="invoices-list-header">
        <div>
          <h3 className="section-title">Invoice Ledger</h3>
          <p className="section-copy">
            Review billed work, payment state, and customer charge history in one place.
          </p>
        </div>
        <div className="invoices-list-count">
          {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
        </div>
      </div>

      {!filteredInvoices.length ? (
        <div className="empty-state">
          <div className="empty-state-icon">💷</div>
          <h4 className="empty-state-title">No invoices yet</h4>
          <p className="empty-state-copy">
            Record billing for repair jobs and sale items to keep the workshop finances organised.
          </p>
        </div>
      ) : (
        <div className="invoices-grid">
          {filteredInvoices.map((invoice) => {
            const customerName = invoice.customer_first_name
              ? `${invoice.customer_first_name} ${invoice.customer_last_name}`
              : 'Unknown customer';
            const reference = invoice.job_no
              ? `Job #${invoice.job_no}`
              : invoice.sale_item_no
              ? `Sale item #${invoice.sale_item_no}`
              : 'No reference';
            const paymentType = invoice.payment_type || 'Unknown';
            const datePaid = invoice.date_paid ? `Paid ${invoice.date_paid}` : 'Pending';

            return (
              <article className="invoice-card" key={invoice.invoice_no}>
                <div className="invoice-card-header">
                  <div>
                    <h4 className="invoice-title">Invoice #{invoice.invoice_no}</h4>
                    <p className="invoice-name">{customerName}</p>
                  </div>
                  <div className="invoice-total">£{Number(invoice.total_cost).toFixed(2)}</div>
                </div>

                <div className="invoice-summary">
                  <span>{reference}</span>
                  <span>{paymentType}</span>
                  <span>{datePaid}</span>
                </div>

                <div className="card-actions invoice-actions">
                  <button
                    aria-label={`View invoice ${invoice.invoice_no}`}
                    className="icon-button"
                    onClick={() => onView(invoice.invoice_no)}
                    title="View details"
                    type="button"
                  >
                    ⓘ
                  </button>
                  <button
                    aria-label={`Edit invoice ${invoice.invoice_no}`}
                    className="icon-button"
                    onClick={() => onEdit(invoice.invoice_no)}
                    title="Edit"
                    type="button"
                  >
                    ✎
                  </button>
                  <button
                    aria-label={`Delete invoice ${invoice.invoice_no}`}
                    className="icon-button danger"
                    onClick={() => {
                      if (window.confirm(`Delete invoice #${invoice.invoice_no}?`)) {
                        onDelete(invoice.invoice_no);
                      }
                    }}
                    title="Delete"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default InvoicesList;
