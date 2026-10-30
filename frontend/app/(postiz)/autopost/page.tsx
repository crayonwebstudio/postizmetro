'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Page, Empty, ErrorBox, ListCard, asArray, useApi } from '@/components/postiz/ui';
import { get, post, put, del } from '@/lib/postiz';

export default function AutopostPage() {
  const { data, error, loading, refresh } = useApi(() => get('/autopost'));
  const { data: integrations } = useApi(() => get('/integrations/list'));
  const items = asArray(data);
  const channels = asArray((integrations as any)?.integrations);
  const [title, setTitle] = useState(''); const [url, setUrl] = useState(''); const [content, setContent] = useState('');
  const [onSlot, setOnSlot] = useState(false); const [syncLast, setSyncLast] = useState(false); const [active, setActive] = useState(true);
  const [addPicture, setAddPicture] = useState(false); const [generateContent, setGenerateContent] = useState(false);
  const [sel, setSel] = useState<string[]>([]); const [editId, setEditId] = useState(''); const [msg, setMsg] = useState('');
  function body() { return { title, url, content, onSlot, syncLast, active, addPicture, generateContent, integrations: sel.map((id) => ({ id })) }; }
  async function save() { try { if (editId) await put(`/autopost/${editId}`, body()); else await post('/autopost', body()); setMsg('Saved via autopost endpoint.'); refresh(); } catch (e: any) { setMsg('Error: ' + e.message); } }
  function edit(it: any) { setEditId(it.id); setTitle(it.title || ''); setUrl(it.url || ''); setContent(it.content || ''); setOnSlot(!!it.onSlot); setSyncLast(!!it.syncLast); setActive(!!it.active); setAddPicture(!!it.addPicture); setGenerateContent(!!it.generateContent); setSel((it.integrations || []).map((x: any) => x.id || x)); }
  return (
    <Page title="Autopost" description="From GET /autopost. Create/edit uses AutopostDto exactly: title, content, url, onSlot, syncLast, active, addPicture, generateContent, integrations [{id}].">
      {error && <ErrorBox error={error} />}
      <ListCard title={editId ? 'Edit autopost rule' : 'Create autopost rule'} description="All boolean fields are required by AutopostDto, so they are always sent, never omitted.">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Feed URL * (must be a URL)" />
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content template" rows={3} />
        {([['onSlot', onSlot, setOnSlot], ['syncLast', syncLast, setSyncLast], ['active', active, setActive], ['addPicture', addPicture, setAddPicture], ['generateContent', generateContent, setGenerateContent]] as const).map(([label, v, set]) => (<label key={label} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v} onChange={(e) => (set as any)(e.target.checked)} /> {label}</label>))}
        <div className="text-sm">Channels: {channels.length === 0 ? 'No channels yet.' : ''}</div>
        <div className="flex flex-wrap gap-2">{channels.map((c: any) => (<Button key={c.id} size="sm" variant={sel.includes(c.id) ? 'primary' : 'outline'} onClick={() => setSel((s) => s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id])}>{c.name || c.identifier}</Button>))}</div>
        <div className="flex gap-2"><Button onClick={save}>{editId ? 'Update rule' : 'Create rule'}</Button>{editId && <Button variant="outline" onClick={() => { setEditId(''); setTitle(''); setUrl(''); }}>Cancel edit</Button>}</div>
        {msg && <p className="text-sm">{msg}</p>}
      </ListCard>
      {loading && <Empty text="Loading..." />}
      {!loading && !error && items.length === 0 && <Empty text="No autopost rules yet." />}
      {items.map((it: any, i: number) => (<Card key={it.id || i}><CardContent className="pt-4 grid gap-2 text-sm"><div className="font-medium">{it.title} {it.active ? '(active)' : '(inactive)'}</div><div className="text-muted-foreground">{it.url || ''}</div><pre className="text-xs overflow-auto">{JSON.stringify(it, null, 2)}</pre><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => edit(it)}>Edit</Button><Button size="sm" variant="outline" onClick={async () => { await post(`/autopost/${it.id}/active`, { active: !it.active }); refresh(); }}>Toggle active</Button><Button size="sm" variant="destructive" onClick={async () => { await del(`/autopost/${it.id}`); refresh(); }}>Delete</Button></div></CardContent></Card>))}
    </Page>
  );
}
