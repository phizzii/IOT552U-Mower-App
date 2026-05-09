import { API_BASE_URL } from '../config';
 
function buildUrl(path, params) {
  const url = new URL(`${API_BASE_URL}${path}`);
 
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }
 
  return url.toString();
}
 
export async function fetchJson(path, options = {}) {
  const { params, ...fetchOptions } = options;
 
  const response = await fetch(buildUrl(path, params), {
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...fetchOptions,
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