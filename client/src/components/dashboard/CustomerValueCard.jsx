import { useState } from 'react';
import DashboardSection from './DashboardSection';
import { formatCurrency } from '../../utils/formatters';

function CustomerValueCard({ topCustomers = [] }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const customers = topCustomers;
  const maxValue = customers.reduce(
    (highest, customer) => Math.max(highest, Number(customer.lifetimeValue) || 0),
    0
  );

  const totalShownValue = customers.reduce(
    (sum, customer) => sum + Number(customer.lifetimeValue || 0),
    0
  );

  const topCustomerShare =
    customers.length > 0 && totalShownValue > 0
      ? ((Number(customers[0].lifetimeValue || 0) / totalShownValue) * 100)
      : 0;

  const selectedCustomer =
    selectedCustomerId == null
      ? null
      : customers.find((customer) => customer.customerId === selectedCustomerId) || null;

  function handleCustomerClick(customerId) {
    setSelectedCustomerId((current) => (current === customerId ? null : customerId));
  }

  return (
    <DashboardSection eyebrow="Customer Analysis" title="Top Customers by Lifetime Value">
      {customers.length === 0 ? (
        <div className="report-empty-state">No customer value data available</div>
      ) : (
        <>
          <div className="report-bar-list">
            {customers.map((customer) => {
              const value = Number(customer.lifetimeValue) || 0;
              const isSelected = selectedCustomerId === customer.customerId;

              return (
                <article
                  className={`report-bar-row report-bar-row--interactive ${isSelected ? 'is-selected' : ''}`}
                  key={customer.customerId}
                >
                  <button
                    className="report-bar-button"
                    onClick={() => handleCustomerClick(customer.customerId)}
                    type="button"
                  >
                    <div className="report-bar-header">
                      <div className="report-bar-copy">
                        <strong>{customer.name}</strong>
                        <span>
                          {customer.jobCount} jobs · {customer.invoiceCount} invoices
                          {customer.machineCount !== undefined ? ` · ${customer.machineCount} machines` : ''}
                        </span>
                      </div>
                      <span className="report-bar-value">{formatCurrency(value)}</span>
                    </div>

                    <div className="report-bar-track">
                      <div
                        className={`report-bar-fill is-customer ${isSelected ? 'is-selected' : ''}`}
                        style={{
                          width: maxValue > 0 ? `${(value / maxValue) * 100}%` : '0%',
                        }}
                      />
                    </div>
                  </button>
                </article>
              );
            })}
          </div>

          {selectedCustomer ? (
            <div className="dashboard-inline-note">
              <span className="dashboard-inline-label">Selected customer</span>
              <strong>
                {selectedCustomer.name} · {formatCurrency(selectedCustomer.lifetimeValue || 0)} ·{' '}
                {selectedCustomer.jobCount} jobs · {selectedCustomer.invoiceCount} invoices
                {selectedCustomer.machineCount !== undefined
                  ? ` · ${selectedCustomer.machineCount} machines`
                  : ''}
                {' · '}
                {(
                  ((Number(selectedCustomer.lifetimeValue || 0) / totalShownValue) * 100) || 0
                ).toFixed(1)}
                % of shown customer value
              </strong>
            </div>
          ) : (
            <div className="dashboard-inline-note">
              <span className="dashboard-inline-label">Top customer share</span>
              <strong>{topCustomerShare.toFixed(1)}% of shown customer value</strong>
            </div>
          )}

          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Jobs</th>
                  <th>Invoices</th>
                  <th>Machines</th>
                  <th>Lifetime Value</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const isSelected = selectedCustomerId === customer.customerId;

                  return (
                    <tr
                      className={isSelected ? 'report-table-row-selected' : ''}
                      key={`table-${customer.customerId}`}
                    >
                      <td>{customer.name}</td>
                      <td>{customer.jobCount}</td>
                      <td>{customer.invoiceCount}</td>
                      <td>{customer.machineCount ?? '—'}</td>
                      <td>{formatCurrency(customer.lifetimeValue || 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardSection>
  );
}

export default CustomerValueCard;