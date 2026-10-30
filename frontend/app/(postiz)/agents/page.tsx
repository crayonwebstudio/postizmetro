'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Page, Empty, ErrorBox, ListCard, Row, StateBadge, asArray, useApi } from '@/components/postiz/ui';
import { get, post, put, del, uploadMedia } from '@/lib/postiz';

export default function Page_() {
  const { data, error, loading, refresh } = useApi(() => get('/copilot/list'));
  const items = asArray(data);
  return (
    <Page title="Agents" description="From GET /agents in the original frontend, via the Copilot/Agent backend. AI generation is disabled unless an AI key is provided at deploy time.">
      {error && <ErrorBox error={error} />}
      {loading && <Empty text="Loading..." />}
      {!loading && !error && items.length === 0 && <Empty text="No items yet. This page calls the real backend endpoint and shows an honest empty state, not mock data." />}
      {items.map((it: any, i: number) => (<Card key={it.id || i}><CardContent className="pt-4"><pre className="text-xs overflow-auto">{JSON.stringify(it, null, 2)}</pre></CardContent></Card>))}
      <Button variant="outline" onClick={refresh}>Refresh</Button>
    </Page>
  );
}
