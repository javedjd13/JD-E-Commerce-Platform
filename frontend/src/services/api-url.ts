export function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) return apiUrl.replace(/\/$/, '');

  return process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000/api/v1';
}

export function assertApiUrl(apiUrl: string) {
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is required in production deployments.');
  }
}
