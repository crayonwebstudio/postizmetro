'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Page, Empty, ErrorBox, useApi } from '@/components/postiz/ui';
import { get } from '@/lib/postiz';
import { use } from 'react';

export default function PostStatisticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading } = useApi(() => get(`/posts/${encodeURIComponent(id)}/statistics`));
  const clicks: any = (data as any)?.clicks;
  const list = Array.isArray(clicks) ? clicks : clicks ? [clicks] : [];
  return (
    <Page title="Post statistics" description={`From GET /posts/${id}/statistics. Backend returns short-link click tracking only (posts.service getStatistics returns {clicks}). No other analytics are invented here.`}>
      {error && <ErrorBox error={error} />}
      {loading && <Empty text="Loading statistics..." />}
      {!loading && !error && list.length === 0 && <Empty text="No click statistics returned for this post yet. That is the real backend response, not a zero-filled chart." />}
      {list.map((c: any, i: number) => (<Card key={i}><CardContent className="pt-4"><pre className="text-xs overflow-auto">{JSON.stringify(c, null, 2)}</pre></CardContent></Card>))}
      {!loading && !error && <Card><CardContent className="pt-4 text-sm">Raw response: <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre></CardContent></Card>}
    </Page>
  );
}
