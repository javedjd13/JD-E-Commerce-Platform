export function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (apiUrl) return apiUrl.replace(/\/$/, '');

  return process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000/api/v1';
}

export function assertApiUrl(apiUrl: string) {
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is required in production deployments.');
  }

  if (process.env.NODE_ENV !== 'production') return;

  let url: URL;

  try {
    url = new URL(apiUrl);
  } catch {
    throw new Error(
      'NEXT_PUBLIC_API_URL must be an absolute backend URL, for example https://api.example.com/api/v1.',
    );
  }

  const localHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]']);

  if (localHosts.has(url.hostname)) {
    throw new Error(
      'NEXT_PUBLIC_API_URL cannot point to localhost in production. Set it to the deployed backend HTTPS URL.',
    );
  }

  if (url.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_API_URL must use HTTPS in production.');
  }
}
