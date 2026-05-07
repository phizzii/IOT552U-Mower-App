import { useMemo, useState } from 'react';
import usePagination from '../../hooks/usePagination';
import ExpandableRecord from '../shared/ExpandableRecord';
import PaginationControls from '../shared/PaginationControls';

function InvoicesList({ invoices, onDelete, onEdit, onView }) {
  const [openInvoiceId, setOpenInvoiceId] = useState(null);
  const filteredInvoices = useMemo(() => invoices, [invoices]);
  const {
    currentPage,
    paginatedItems,
    range,
    setCurrentPage,
    totalItems,
    totalPages,
  } = usePagination(filteredInvoices);

  return (
    <div className="invoices-list-card surface-card">
      <div className="invoices-list-header">
        <div>
          <h3 className="section-title">Invoice Ledger</h3>
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
        <>
        <div className="record-list">
          {paginatedItems.map((invoice) => {
            const customerName = invoice.customer_first_name
              ? `${invoice.customer_first_name} ${invoice.customer_last_name}`
              : 'Unknown customer';
            const reference = invoice.job_no
              ? `Job #${invoice.job_no}${invoice.sale_item_summary ? ` + ${invoice.sale_item_summary}` : ''}`
              : invoice.sale_item_summary
              ? invoice.sale_item_summary
              : invoice.sale_item_no
              ? `Sale item #${invoice.sale_item_no}`
              : 'No reference';
            const paymentType = invoice.payment_type || 'Unknown';
            const datePaid = invoice.date_paid ? `Paid ${invoice.date_paid}` : 'Pending';

            return (
              <ExpandableRecord
                actions={
                  <>
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
                  </>
                }
                isOpen={openInvoiceId === invoice.invoice_no}
                key={invoice.invoice_no}
                onToggle={() =>
                  setOpenInvoiceId((current) =>
                    current === invoice.invoice_no ? null : invoice.invoice_no
                  )
                }
                subtitle={customerName}
                summary={`£${Number(invoice.total_cost).toFixed(2)}`}
                title={`Invoice #${invoice.invoice_no}`}
              >
                <div className="record-detail-grid">
                  <div className="record-detail-item">
                    <span className="record-detail-label">Reference</span>
                    <strong>{reference}</strong>
                  </div>
                  <div className="record-detail-item">
                    <span className="record-detail-label">Payment type</span>
                    <strong>{paymentType}</strong>
                  </div>
                  <div className="record-detail-item">
                    <span className="record-detail-label">Status</span>
                    <strong>{datePaid}</strong>
                  </div>
                </div>
              </ExpandableRecord>
            );
          })}
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
    </div>
  );
}

export default InvoicesList;
