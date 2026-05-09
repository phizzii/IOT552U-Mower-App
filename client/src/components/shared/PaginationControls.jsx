function PaginationControls({
  currentPage,
  onPageChange,
  range,
  totalItems,
  totalPages,
}) {
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-row">
      <div className="pagination-summary">
        Showing {range.start}-{range.end} of {totalItems}
      </div>

      <div className="pagination-controls">
        <button
          className="secondary-button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          Previous
        </button>

        <div className="pagination-pages">
          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;

            return (
              <button
                aria-current={page === currentPage ? 'page' : undefined}
                className={`pagination-page-button${page === currentPage ? ' is-active' : ''}`}
                key={page}
                onClick={() => onPageChange(page)}
                type="button"
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          className="secondary-button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;
