import DashboardSection from './DashboardSection';

function CustomerValueCard({ topCustomers }) {
  function formatCurrency(value) {
    return new Intl.NumberFormat('en-GB', {
      currency: 'GBP',
      style: 'currency',
    }).format(value || 0);
  }

  return (
    <DashboardSection eyebrow="Customer Analysis" title="Top customers by lifetime value">
      <p className="section-copy">
        Your most valuable customers. Focus retention efforts here and look for patterns in what
        makes these relationships strong.
      </p>

      <div className="dashboard-status-list">
        {topCustomers.length > 0 ? (
          topCustomers.map((customer, index) => (
            <div className="dashboard-status-row" key={customer.customerId}>
              <div className="dashboard-status-copy">
                <strong>
                  {index + 1}. {customer.name}
                </strong>
                <span>{customer.jobCount} jobs • {customer.invoiceCount} invoices</span>
              </div>
              <div>
                <strong style={{ color: 'var(--highlight)' }}>
                  {formatCurrency(customer.lifetimeValue)}
                </strong>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>No customer data available</p>
        )}
      </div>
    </DashboardSection>
  );
}

export default CustomerValueCard;
