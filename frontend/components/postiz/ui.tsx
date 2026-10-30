
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

export function Page({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="container-fluid grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
export function Empty({ text }: { text: string }) {
  return (
    <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">{text}</CardContent></Card>
  );
}
export function ErrorBox({ error }: { error: string }) {
  return (
    <Card><CardContent className="py-6 text-sm text-red-600">Backend error: {error}. Check that NEXT_PUBLIC_BACKEND_URL points at the PostizMetro backend and that the backend is running.</CardContent></Card>
  );
}
export function ListCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle>{description && <CardDescription>{description}</CardDescription>}</CardHeader>
      <CardContent className="grid gap-3">{children}</CardContent>
    </Card>
  );
}
export function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b py-2 last:border-0">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground flex items-center gap-2">{value}</span>
    </div>
  );
}
export function StateBadge({ state }: { state?: string }) {
  const s = (state || 'unknown').toLowerCase();
  return <Badge variant={s === 'published' ? 'success' : s === 'scheduled' || s === 'queue' ? 'info' : s === 'draft' ? 'secondary' : 'outline'}>{state || 'unknown'}</Badge>;
}
export function asArray(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.posts)) return v.posts;
  if (v && Array.isArray(v.items)) return v.items;
  if (v && Array.isArray(v.data)) return v.data;
  return [];
}
export function useApi<T = any>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    setLoading(true);
    fn().then((d) => { if (live) { setData(d); setError(''); } }).catch((e: any) => { if (live) setError(e.message || String(e)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, error, loading, refresh: () => { setLoading(true); fn().then(setData).catch((e: any) => setError(e.message)).finally(() => setLoading(false)); } };
}
