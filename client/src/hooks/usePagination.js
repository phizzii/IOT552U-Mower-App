import { useEffect, useMemo, useState } from 'react';

function usePagination(items, options = {}) {
  const {
    pageSize = 10,
    resetKeys = [],
  } = options;
  const [currentPage, setCurrentPage] = useState(1);
  const resetSignature = JSON.stringify(resetKeys);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [resetSignature]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [currentPage, items, pageSize]);

  const range = useMemo(() => {
    if (items.length === 0) {
      return { end: 0, start: 0 };
    }

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, items.length);

    return { end, start };
  }, [currentPage, items.length, pageSize]);

  return {
    currentPage,
    paginatedItems,
    range,
    setCurrentPage,
    totalItems: items.length,
    totalPages,
  };
}

export default usePagination;
