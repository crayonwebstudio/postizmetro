'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Page, Empty, ErrorBox, ListCard, Row, StateBadge, asArray, useApi } from '@/components/postiz/ui';
import { get, post, put, del, uploadMedia } from '@/lib/postiz';

export default function AnalyticsPage() {
  const { data, error, loading } = useApi(() => get('/analytics'));
  const stars: any[] = asArray((data as any)?.stars).concat(asArray(data));
  return (
    <Page title="Analytics" description="From GET /analytics. Per-post statistics are on the Launches page via GET /posts/:id/statistics.">
      {error && <ErrorBox error={error} />}
      {loading && <Empty text="Loading analytics..." />}
      {!loading && !error && stars.length === 0 && <Empty text="No analytics data yet." />}
      {stars.map((s: any, i: number) => (<Card key={i}><CardContent className="pt-4"><pre className="text-xs overflow-auto">{JSON.stringify(s, null, 2)}</pre></CardContent></Card>))}
    </Page>
  );
}
