'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Page, Empty, ErrorBox, ListCard, asArray, useApi } from '@/components/postiz/ui';
import { get, post, put, del } from '@/lib/postiz';

export default function SignaturesPage() {
  const { data, error, loading, refresh } = useApi(() => get('/signatures'));
  const { data: def } = useApi(() => get('/signatures/default'));
  const items = asArray(data);
  const [content, setContent] = useState(''); const [autoAdd, setAutoAdd] = useState(false); const [editId, setEditId] = useState(''); const [msg, setMsg] = useState('');
  async function save() { try { if (editId) await put(`/signatures/${editId}`, { content, autoAdd }); else await post('/signatures', { content, autoAdd }); setMsg('Saved via signatures endpoint.'); refresh(); } catch (e: any) { setMsg('Error: ' + e.message); } }
  return (
    <Page title="Signatures" description="From GET /signatures. Create/edit uses SignatureDto: content (required string), autoAdd (required boolean). Default signature from GET /signatures/default is shown below.">
      {error && <ErrorBox error={error} />}
      <ListCard title="Default signature (backend)"><pre className="text-xs overflow-auto">{JSON.stringify(def, null, 2)}</pre></ListCard>
      <ListCard title={editId ? 'Edit signature' : 'Create signature'}>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Signature content *" rows={4} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={autoAdd} onChange={(e) => setAutoAdd(e.target.checked)} /> Auto add</label>
        <div className="flex gap-2"><Button onClick={save}>{editId ? 'Update signature' : 'Create signature'}</Button>{editId && <Button variant="outline" onClick={() => { setEditId(''); setContent(''); setAutoAdd(false); }}>Cancel edit</Button>}</div>
        {msg && <p className="text-sm">{msg}</p>}
      </ListCard>
      {loading && <Empty text="Loading..." />}
      {!loading && !error && items.length === 0 && <Empty text="No signatures yet." />}
      {items.map((it: any, i: number) => (<Card key={it.id || i}><CardContent className="pt-4 grid gap-2 text-sm"><div>{it.content}</div><div className="text-muted-foreground">Auto add: {String(it.autoAdd)}</div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => { setEditId(it.id); setContent(it.content || ''); setAutoAdd(!!it.autoAdd); }}>Edit</Button><Button size="sm" variant="destructive" onClick={async () => { await del(`/signatures/${it.id}`); refresh(); }}>Delete</Button></div></CardContent></Card>))}
    </Page>
  );
}
