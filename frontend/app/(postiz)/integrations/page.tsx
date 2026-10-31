'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Page, Empty, ErrorBox, ListCard, Row, StateBadge, asArray, useApi } from '@/components/postiz/ui';
import { get, post, put, del, uploadMedia } from '@/lib/postiz';

export default function IntegrationsPage() {
  const [instagramError, setInstagramError] = useState('');
  const [instagramBusy, setInstagramBusy] = useState(false);
  const { data, error, loading, refresh } = useApi(() => get('/integrations/list'));

  async function connectInstagram() {
    setInstagramError('');
    setInstagramBusy(true);
    try {
      const r: any = await get('/integrations/social/instagram');
      if (!r || r.err || !r.url) {
        setInstagramError('Facebook app not configured yet. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in the PostizMetro backend env, whitelist redirect https://postizmetro.woodwolfdigital.com/integrations/social/instagram in the Meta app, then try again.');
        return;
      }
      window.location.href = r.url;
    } catch (e: any) {
      setInstagramError(e?.message || 'Could not start Instagram connect. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in the PostizMetro backend env, whitelist redirect https://postizmetro.woodwolfdigital.com/integrations/social/instagram in the Meta app, then try again.');
    } finally {
      setInstagramBusy(false);
    }
  }
  const list = asArray((data as any)?.integrations).concat(asArray(data));
  const unique = list.filter((v: any, i: number, a: any[]) => a.findIndex((x) => x.id === v.id) === i);
  return (
    <Page title="Integrations" description="Channels from GET /integrations/list. Connect starts the backend OAuth flow; the callback must point at postizmetro.woodwolfdigital.com, not live Postiz.">
      {error && <ErrorBox error={error} />}
      {loading && <Empty text="Loading integrations..." />}
      {!loading && !error && unique.length === 0 && <Empty text="No integrations yet. Use Connect below for a provider, or connect via the backend OAuth flow." />}
      {unique.map((c: any) => (
        <Card key={c.id}><CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div><div className="font-medium">{c.name || c.identifier || c.id}</div><div className="text-sm text-muted-foreground">{c.identifier || ''} {c.nickname ? `(${c.nickname})` : ''}</div></div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={async () => { await post(`/integrations/${c.id}/settings`, {}); refresh(); }}>Settings</Button>
            <Button size="sm" variant="outline" onClick={async () => { await post('/integrations/disable', { id: c.id }); refresh(); }}>Disable</Button>
            <Button size="sm" variant="outline" onClick={async () => { await post('/integrations/enable', { id: c.id }); refresh(); }}>Enable</Button>
            <Button size="sm" variant="destructive" onClick={async () => { await del('/integrations'); refresh(); }}>Delete</Button>
          </div>
        </CardContent></Card>
      ))}
      <ListCard title="Connect a provider" description="Instagram now uses OAuth: it calls GET /integrations/social/instagram, then redirects to Facebook/Instagram. Other providers still use the old button, unchanged.">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={instagramBusy} onClick={connectInstagram}>{instagramBusy ? 'Starting Instagram…' : 'instagram'}</Button>
          {['linkedin', 'x', 'facebook', 'youtube', 'tiktok', 'threads', 'pinterest', 'reddit', 'discord', 'slack', 'telegram', 'mastodon', 'bluesky', 'medium', 'wordpress'].map((p) => (<Button key={p} size="sm" variant="outline" onClick={async () => { try { const r = await post(`/integrations/provider/${p}/connect`, {}); alert(JSON.stringify(r).slice(0, 500)); } catch (e: any) { alert(e.message); } }}>{p}</Button>))}
        </div>
        {instagramError && <p className="text-sm text-red-600">{instagramError}</p>}
        <p className="text-sm text-muted-foreground">Instagram requires a Meta Facebook app: set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in the PostizMetro backend env, whitelist https://postizmetro.woodwolfdigital.com/integrations/social/instagram in the Meta app, and use an Instagram business account connected to a Facebook page. No credentials are stored in this code.</p>
      </ListCard>
    </Page>
  );
}
