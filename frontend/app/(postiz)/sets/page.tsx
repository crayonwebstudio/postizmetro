'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Page, Empty, ErrorBox, ListCard, asArray, useApi } from '@/components/postiz/ui';
import { get, post, put, del } from '@/lib/postiz';

export default function SetsPage() {
  const { data, error, loading, refresh } = useApi(() => get('/sets'));
  const items = asArray(data);
  const [name, setName] = useState(''); const [content, setContent] = useState(''); const [editId, setEditId] = useState(''); const [msg, setMsg] = useState('');
  async function save() { try { if (editId) await put('/sets', { id: editId, name, content }); else await post('/sets', { name, content }); setMsg('Saved via sets endpoint.'); refresh(); } catch (e: any) { setMsg('Error: ' + e.message); } }
  return (
    <Page title="Sets" description="From GET /sets. Create/edit uses SetsDto: name and content, both required. Update uses PUT /sets with id in the body, exactly as SetsController defines it.">
      {error && <ErrorBox error={error} />}
      <ListCard title={editId ? 'Edit set' : 'Create set'}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Set name *" />
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Set content *" rows={4} />
        <div className="flex gap-2"><Button onClick={save}>{editId ? 'Update set' : 'Create set'}</Button>{editId && <Button variant="outline" onClick={() => { setEditId(''); setName(''); setContent(''); }}>Cancel edit</Button>}</div>
        {msg && <p className="text-sm">{msg}</p>}
      </ListCard>
      {loading && <Empty text="Loading..." />}
      {!loading && !error && items.length === 0 && <Empty text="No sets yet." />}
      {items.map((it: any, i: number) => (<Card key={it.id || i}><CardContent className="pt-4 grid gap-2 text-sm"><div className="font-medium">{it.name}</div><pre className="text-xs overflow-auto">{JSON.stringify(it, null, 2)}</pre><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => { setEditId(it.id); setName(it.name || ''); setContent(it.content || ''); }}>Edit</Button><Button size="sm" variant="destructive" onClick={async () => { await del(`/sets/${it.id}`); refresh(); }}>Delete</Button></div></CardContent></Card>))}
    </Page>
  );
}
