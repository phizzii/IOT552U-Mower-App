import { API_BASE_URL } from '../config';

export async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload.error ||
      payload.errors?.join(', ') ||
      'The request could not be completed.';

    throw new Error(message);
  }

  return payload;
}
