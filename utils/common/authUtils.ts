import fetch from 'node-fetch';

export async function loginAndGetToken(url: string, credentials: Record<string, unknown>): Promise<string> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) throw new Error(`Login failed with status ${response.status}`);
  const body = await response.json() as { token?: string; access_token?: string };
  const token = body.token || body.access_token;
  if (!token) throw new Error('Login response did not contain token or access_token');
  return token;
}
