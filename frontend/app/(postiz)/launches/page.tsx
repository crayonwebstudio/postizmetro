'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Page, Empty, ErrorBox, ListCard, Row, StateBadge, asArray, useApi } from '@/components/postiz/ui';
import { get, post, put, del, uploadMedia } from '@/lib/postiz';

export default function LaunchesPage() {
  const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString(); const end = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
  const { data, error, loading, refresh } = useApi(() => get(`/posts?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`));
  const posts = asArray(data);
  const [deleting, setDeleting] = useState('');
  return (
    <Page title="Launches" description="Posts from the Postiz backend. No mock posts are shown." actions={<Button onClick={refresh}>Refresh</Button>}>
      {loading && <Empty text="Loading launches..." />}
      {error && <ErrorBox error={error} />}
      {!loading && !error && posts.length === 0 && <Empty text="No launches yet. Create one in Composer." />}
      {posts.map((p: any) => (
        <Card key={p.id || p.group}>
          <CardHeader><CardTitle className="text-base">{p.content?.[0]?.content || p.title || 'Post'}</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <Row label="State" value={<StateBadge state={p.state} />} />
            <Row label="Publish date" value={p.publishDate ? new Date(p.publishDate).toLocaleString() : '-'} />
            <Row label="Group" value={p.group || '-'} />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { window.location.href = `/launches/${p.id}/statistics`; }}>Statistics</Button>
              <Button size="sm" variant="outline" onClick={async () => { await post(`/posts/${p.id}/comments`, { comment: 'Reviewed in PostizMetro' }); refresh(); }}>Add review comment</Button>
              <Button size="sm" variant="destructive" disabled={deleting === p.group} onClick={async () => { setDeleting(p.group); try { await del(`/posts/${p.group}`); refresh(); } catch (e: any) { alert(e.message); } finally { setDeleting(''); } }}>Delete group</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </Page>
  );
}
