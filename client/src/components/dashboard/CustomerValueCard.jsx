import DashboardSection from './DashboardSection';
import { formatCurrency } from '../../utils/formatters';

function CustomerValueCard({ topCustomers }) {
  return (
    <DashboardSection eyebrow="Customer Analysis" title="Top customers by lifetime value">
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
