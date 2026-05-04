import { useMemo, useState } from 'react';

function CustomersList({
  customers,
  onDelete,
  onEdit,
  onView,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) {
      return customers;
    }

    const term = searchTerm.toLowerCase();
    return customers.filter((customer) => {
      const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
      const phone = (customer.phone_number || '').toLowerCase();
      const address = `${customer.address_line_1 || ''} ${customer.address_line_2 || ''} ${customer.address_line_3 || ''}`.toLowerCase();
      
      return (
        fullName.includes(term) ||
        phone.includes(term) ||
        address.includes(term)
      );
    });
  }, [customers, searchTerm]);

  return (
    <section className="surface-card customers-list-card" data-reveal="customers-list">
      <div className="customers-list-header">
        <div>
          <span className="section-label">Customers</span>
          <h2 className="section-title">Profiles & Ownership</h2>
        </div>
        <div className="customers-list-count">{filteredCustomers.length} shown</div>
      </div>

      <div className="search-field-group">
        <input
          className="field-control"
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, phone, or address..."
          type="text"
          value={searchTerm}
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="empty-state">
          <strong>
            {customers.length === 0 ? 'No customers yet.' : 'No customers match your search.'}
          </strong>
          <span>
            {customers.length === 0
              ? 'Create the first customer to get started.'
              : 'Try different search terms.'}
          </span>
        </div>
      ) : (
        <div className="customers-grid">
          {filteredCustomers.map((customer) => (
            <div className="customer-card" key={customer.customer_id}>
              <div className="card-header">
                <div className="customer-name">
                  {customer.first_name} {customer.last_name}
                </div>
                <div className="card-actions">
                  <button
                    aria-label={`View ${customer.first_name} ${customer.last_name}`}
                    className="icon-button"
                    onClick={() => onView(customer.customer_id)}
                    title="View details"
                    type="button"
                  >
                    ⓘ
                  </button>
                  <button
                    aria-label={`Edit ${customer.first_name} ${customer.last_name}`}
                    className="icon-button"
                    onClick={() => onEdit(customer.customer_id)}
                    title="Edit"
                    type="button"
                  >
                    ✎
                  </button>
                  <button
                    aria-label={`Delete ${customer.first_name} ${customer.last_name}`}
                    className="icon-button danger"
                    onClick={() => {
                      if (window.confirm(`Delete ${customer.first_name} ${customer.last_name}?`)) {
                        onDelete(customer.customer_id);
                      }
                    }}
                    title="Delete"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="card-body">
                {customer.phone_number && (
                  <div className="contact-row">
                    <span className="label">Phone</span>
                    <span className="value">{customer.phone_number}</span>
                  </div>
                )}

                {customer.address_line_1 && (
                  <div className="address-section">
                    <span className="label">Address</span>
                    <div className="address-block">
                      {customer.address_line_1}
                      {customer.address_line_2 && <br />}
                      {customer.address_line_2}
                      {customer.address_line_3 && <br />}
                      {customer.address_line_3}
                      {customer.postcode && <br />}
                      {customer.postcode}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default CustomersList;
