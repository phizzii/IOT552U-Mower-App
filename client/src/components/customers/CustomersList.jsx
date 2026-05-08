import { useMemo, useState } from 'react';
import usePagination from '../../hooks/usePagination';
import ExpandableRecord from '../shared/ExpandableRecord';
import PaginationControls from '../shared/PaginationControls';

function renderAddress(customer) {
  return [
    customer.address_line_1,
    customer.address_line_2,
    customer.address_line_3,
    customer.postcode,
  ]
    .filter(Boolean)
    .join(', ');
}

function CustomersList({
  customers,
  onDelete,
  onEdit,
  onView,
}) {
  const [openCustomerId, setOpenCustomerId] = useState(null);
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
      const postcode = (customer.postcode || '').toLowerCase();
      
      return (
        fullName.includes(term) ||
        phone.includes(term) ||
        address.includes(term) ||
        postcode.includes(term)
      );
    });
  }, [customers, searchTerm]);
  const {
    currentPage,
    paginatedItems,
    range,
    setCurrentPage,
    totalItems,
    totalPages,
  } = usePagination(filteredCustomers, {
    resetKeys: [searchTerm],
  });

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
          placeholder="Search by name, phone, address, or postcode..."
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
        <>
        <div className="record-list">
          {paginatedItems.map((customer) => (
            <ExpandableRecord
              actions={
                <>
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
                </>
              }
              isOpen={openCustomerId === customer.customer_id}
              key={customer.customer_id}
              onToggle={() =>
                setOpenCustomerId((current) =>
                  current === customer.customer_id ? null : customer.customer_id
                )
              }
              subtitle={customer.phone_number || 'No phone number'}
              summary={customer.postcode || 'No postcode'}
              title={`${customer.first_name} ${customer.last_name}`}
            >
              <div className="record-detail-grid">
                <div className="record-detail-item">
                  <span className="record-detail-label">Phone</span>
                  <strong>{customer.phone_number || 'Not set'}</strong>
                </div>
                <div className="record-detail-item record-detail-item--wide">
                  <span className="record-detail-label">Address</span>
                  <strong>{renderAddress(customer) || 'No address recorded'}</strong>
                </div>
              </div>
            </ExpandableRecord>
          ))}
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
    </section>
  );
}

export default CustomersList;
