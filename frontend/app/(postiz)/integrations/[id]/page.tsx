'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Page, Empty, ErrorBox, ListCard, Row, StateBadge, asArray, useApi } from '@/components/postiz/ui';
import { get, post, put, del, uploadMedia } from '@/lib/postiz';

import { useParams } from 'next/navigation';
export default function IntegrationDetailPage() {
  const params = useParams(); const id = String((params as any).id);
  const { data, error, loading } = useApi(() => get(`/integrations/${encodeURIComponent(id)}`), [id]);
  return (
    <Page title="Integration detail" description={`Backend: GET /integrations/${id}`}>
      {error && <ErrorBox error={error} />}
      {loading && <Empty text="Loading..." />}
      {!loading && !error && <Card><CardContent className="pt-4"><pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre></CardContent></Card>}
    </Page>
  );
}
