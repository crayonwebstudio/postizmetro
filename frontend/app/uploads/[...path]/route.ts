import { NextRequest } from 'next/server';
// Proxy /uploads/* on the frontend domain to the backend uploads directory.
// Media records store FRONTEND_URL + '/uploads/...', so this keeps those
// URLs reachable in the split frontend/backend architecture.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const res = await fetch(`${backend}/uploads/${path.map(encodeURIComponent).join('/')}`);
  if (!res.ok) return new Response('Not found', { status: res.status });
  return new Response(res.body, { headers: { 'Content-Type': res.headers.get('content-type') || 'application/octet-stream', 'Cache-Control': 'public, max-age=86400' } });
}
