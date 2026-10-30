
// PostizMetro API client. Talks over HTTP to the Postiz NestJS backend.
// Base URL comes only from NEXT_PUBLIC_BACKEND_URL, no auth header is sent
// in the review build: the fixed review workspace is resolved server-side
// by PublicWorkspaceMiddleware in the backend copy.
export const backendUrl = () =>
  (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${backendUrl()}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = data?.message || data?.error || `Backend request failed: ${res.status} ${path}`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : String(msg));
  }
  return data as T;
}
export const get = <T = any>(p: string) => api<T>(p);
export const post = <T = any>(p: string, body: any) => api<T>(p, { method: 'POST', body: JSON.stringify(body) });
export const put = <T = any>(p: string, body: any) => api<T>(p, { method: 'PUT', body: JSON.stringify(body) });
export const del = <T = any>(p: string) => api<T>(p, { method: 'DELETE' });

export async function uploadMedia(file: File): Promise<any> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${backendUrl()}/media/upload-simple`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`Media upload failed: ${res.status}`);
  return res.json();
}
