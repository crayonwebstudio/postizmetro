'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Page, Empty, ErrorBox, ListCard, asArray, useApi } from '@/components/postiz/ui';
import { get, post, put, del } from '@/lib/postiz';

export default function WebhooksPage() {
  const { data, error, loading, refresh } = useApi(() => get('/webhooks'));
  const { data: integrations } = useApi(() => get('/integrations/list'));
  const items = asArray(data);
  const channels = asArray((integrations as any)?.integrations);
  const [name, setName] = useState(''); const [url, setUrl] = useState(''); const [sel, setSel] = useState<string[]>([]); const [editId, setEditId] = useState(''); const [msg, setMsg] = useState('');
  async function save() { try { const body = { name, url, integrations: sel.map((id) => ({ id })) }; if (editId) await put('/webhooks', { id: editId, ...body }); else await post('/webhooks', body); setMsg('Saved via webhooks endpoint.'); refresh(); } catch (e: any) { setMsg('Error: ' + e.message); } }
  return (
    <Page title="Webhooks" description="From GET /webhooks. Create/edit uses WebhooksDto: name, url (must be a URL), integrations [{id}]. Update uses PUT /webhooks with id in the body.">
      {error && <ErrorBox error={error} />}
      <ListCard title={editId ? 'Edit webhook' : 'Create webhook'}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Webhook name *" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Webhook URL * (https://...)" />
        <div className="text-sm">Channels:</div>
        <div className="flex flex-wrap gap-2">{channels.map((c: any) => (<Button key={c.id} size="sm" variant={sel.includes(c.id) ? 'primary' : 'outline'} onClick={() => setSel((s) => s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id])}>{c.name || c.identifier}</Button>))}</div>
        <div className="flex gap-2"><Button onClick={save}>{editId ? 'Update webhook' : 'Create webhook'}</Button>{editId && <Button variant="outline" onClick={() => { setEditId(''); setName(''); setUrl(''); }}>Cancel edit</Button>}</div>
        {msg && <p className="text-sm">{msg}</p>}
      </ListCard>
      {loading && <Empty text="Loading..." />}
      {!loading && !error && items.length === 0 && <Empty text="No webhooks yet." />}
      {items.map((it: any, i: number) => (<Card key={it.id || i}><CardContent className="pt-4 grid gap-2 text-sm"><div className="font-medium">{it.name}</div><div className="text-muted-foreground">{it.url || ''}</div><pre className="text-xs overflow-auto">{JSON.stringify(it, null, 2)}</pre><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => { setEditId(it.id); setName(it.name || ''); setUrl(it.url || ''); setSel((it.integrations || []).map((x: any) => x.id || x)); }}>Edit</Button><Button size="sm" variant="outline" onClick={async () => { try { const r = await post(`/webhooks/send?url=${encodeURIComponent(it.url)}`, {}); setMsg('Send test response: ' + JSON.stringify(r)); } catch (e: any) { setMsg('Send test error: ' + e.message); } }}>Send test</Button><Button size="sm" variant="destructive" onClick={async () => { await del(`/webhooks/${it.id}`); refresh(); }}>Delete</Button></div></CardContent></Card>))}
    </Page>
  );
}
