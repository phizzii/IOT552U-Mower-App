export function formatCurrency(value) {
  return new Intl.NumberFormat('en-GB', {
    currency: 'GBP',
    style: 'currency',
  }).format(Number(value || 0));
}

export function formatDate(value, fallback = 'Not set') {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export function formatShortDate(value, fallback = 'No date') {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${value}T00:00:00`));
}
