export async function authorizedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = sessionStorage.getItem('auth_token');

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  return await fetch(url, fetchOptions);
}
