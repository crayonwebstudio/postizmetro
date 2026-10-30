'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Page, Empty, ErrorBox, ListCard, Row, StateBadge, asArray, useApi } from '@/components/postiz/ui';
import { get, post, put, del, uploadMedia } from '@/lib/postiz';

export default function MediaPage() {
  const { data, error, loading, refresh } = useApi(() => get('/media'));
  const items = asArray(data);
  const [busy, setBusy] = useState(false);
  return (
    <Page title="Media" description="Media library from GET /media. Uploads go to POST /media/upload-simple.">
      {error && <ErrorBox error={error} />}
      <Card><CardContent className="flex gap-2 pt-6"><Input type="file" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setBusy(true); try { await uploadMedia(f); refresh(); } catch (err: any) { alert(err.message); } finally { setBusy(false); } }} /><Button disabled={busy}>Upload</Button></CardContent></Card>
      {loading && <Empty text="Loading media..." />}
      {!loading && !error && items.length === 0 && <Empty text="No media yet." />}
      <div className="grid md:grid-cols-3 gap-4">{items.map((m: any) => (
        <Card key={m.id}><CardContent className="pt-4 grid gap-2 text-sm"><span>{m.name || m.id}</span><span className="text-muted-foreground">{m.url || ''}</span><Button size="sm" variant="destructive" onClick={async () => { await del(`/media/${m.id}`); refresh(); }}>Delete</Button></CardContent></Card>
      ))}</div>
    </Page>
  );
}
