import DashboardSection from './DashboardSection';
import { formatCurrency } from '../../utils/formatters';

function CustomerValueCard({ topCustomers }) {
  const customers = topCustomers.slice(0, 5);
  const maxValue = customers.reduce(
    (highest, customer) => Math.max(highest, Number(customer.lifetimeValue) || 0),
    0
  );
  const topCustomerShare =
    customers.length > 0
      ? ((Number(customers[0].lifetimeValue || 0) /
          customers.reduce((sum, customer) => sum + Number(customer.lifetimeValue || 0), 0)) *
          100 || 0)
      : 0;

  return (
    <DashboardSection eyebrow="Customer Analysis" title="Top Customers by Lifetime Value">
      {customers.length === 0 ? (
        <div className="report-empty-state">No customer value data available</div>
      ) : (
        <>
          <div className="report-bar-list">
            {customers.map((customer) => {
              const value = Number(customer.lifetimeValue) || 0;

              return (
                <article className="report-bar-row" key={customer.customerId}>
                  <div className="report-bar-header">
                    <div className="report-bar-copy">
                      <strong>{customer.name}</strong>
                      <span>{customer.jobCount} jobs · {customer.invoiceCount} invoices</span>
                    </div>
                    <span className="report-bar-value">{formatCurrency(value)}</span>
                  </div>

                  <div className="report-bar-track">
                    <div
                      className="report-bar-fill is-customer"
                      style={{
                        width: maxValue > 0 ? `${(value / maxValue) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          <div className="dashboard-inline-note">
            <span className="dashboard-inline-label">Top customer share</span>
            <strong>{topCustomerShare.toFixed(1)}% of shown customer value</strong>
          </div>
        </>
      )}
    </DashboardSection>
  );
}

export default CustomerValueCard;
