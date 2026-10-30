'use client';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApi } from '@/components/postiz/ui';
import { get } from '@/lib/postiz';
export default function PublicPreviewPage() {
  const params = useParams(); const id = String((params as any).id);
  const { data, error, loading } = useApi(() => get(`/public/posts/${encodeURIComponent(id)}`), [id]);
  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader><CardTitle>Public post preview</CardTitle></CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {error && <p className="text-sm text-red-600">Preview error: {error}</p>}
          {!loading && !error && <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}
