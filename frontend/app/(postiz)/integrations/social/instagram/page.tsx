'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Page, Empty } from '@/components/postiz/ui';
import { post } from '@/lib/postiz';

export const dynamic = 'force-dynamic';

function InstagramCallbackInner() {
  const params = useSearchParams();
  const done = useRef(false);
  const [status, setStatus] = useState('Connecting Instagram…');
  const [error, setError] = useState('');
  const [integration, setIntegration] = useState<any>(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const [pageId, setPageId] = useState('');
  const [instagramId, setInstagramId] = useState('');
  const [pageMsg, setPageMsg] = useState('');
  const [pageBusy, setPageBusy] = useState(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const code = params.get('code') || '';
    const state = params.get('state') || '';
    const fbError = params.get('error_description') || params.get('error') || '';
    if (fbError) {
      setError(`Facebook/Instagram returned an error: ${fbError}`);
      setStatus('Instagram connect failed.');
      return;
    }
    if (!code || !state) {
      setError('No code or state was returned. Go back to Integrations, click instagram again, and complete the Facebook login. If the Facebook app is not configured yet, set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in the PostizMetro backend env and whitelist https://postizmetro.woodwolfdigital.com/integrations/social/instagram in the Meta app.');
      setStatus('Instagram connect failed.');
      return;
    }
    (async () => {
      try {
        const timezone = String(-new Date().getTimezoneOffset());
        const r: any = await post('/integrations/social/instagram/connect', { code, state, timezone });
        setIntegration(r);
        if (r?.inBetweenSteps) {
          setStatus('Instagram connected, page selection is still needed.');
          setShowPageForm(true);
        } else {
          setStatus(`Instagram connected: ${r?.name || r?.username || r?.id || 'channel created'}.`);
        }
      } catch (e: any) {
        setError(e?.message || 'Could not complete Instagram connect.');
        setStatus('Instagram connect failed.');
      }
    })();
  }, [params]);

  async function continuePageSelection() {
    if (!integration?.id || !pageId || !instagramId) {
      setPageMsg('Enter both a Facebook Page ID and an Instagram Business Account ID.');
      return;
    }
    setPageBusy(true);
    setPageMsg('');
    try {
      const r: any = await post(`/integrations/provider/${encodeURIComponent(String(integration.id))}/connect`, { pageId, id: instagramId });
      if (r?.success) {
        setPageMsg('Page selection completed. The Instagram channel is ready.');
        setShowPageForm(false);
        setStatus(`Instagram connected: ${integration?.name || integration?.username || integration.id}.`);
      } else {
        setPageMsg('Page selection did not return success. Check the two IDs and try again.');
      }
    } catch (e: any) {
      setPageMsg(e?.message || 'Page selection failed. Check the two IDs and try again.');
    } finally {
      setPageBusy(false);
    }
  }

  return (
    <Page title="Instagram connect" description="Callback for https://postizmetro.woodwolfdigital.com/integrations/social/instagram. This posts the OAuth code and state to POST /integrations/social/instagram/connect, never to the provider connect endpoint with the provider name.">
      <Card>
        <CardHeader><CardTitle>{status}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && !integration && <Empty text="Working…" />}
          {integration && (
            <div className="text-sm text-muted-foreground">
              <p>Channel: {integration.name || integration.username || integration.id}</p>
              <p>Integration id: {integration.id}</p>
              {integration.inBetweenSteps ? <p>Next step: select the Facebook page and Instagram business account for this channel.</p> : null}
            </div>
          )}
          {showPageForm && integration?.id && (
            <div className="space-y-3">
              <p className="text-sm">Instagram is a Facebook Business channel, so one more step is needed. Find the Facebook Page ID in the Facebook page settings, and the Instagram Business Account ID in the Instagram business account settings, then enter both below.</p>
              <div className="space-y-2">
                <Label htmlFor="ig-page-id">Facebook Page ID</Label>
                <Input id="ig-page-id" value={pageId} onChange={(e) => setPageId(e.target.value)} placeholder="Example: 123456789012345" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ig-account-id">Instagram Business Account ID</Label>
                <Input id="ig-account-id" value={instagramId} onChange={(e) => setInstagramId(e.target.value)} placeholder="Example: 17841400008460056" />
              </div>
              <Button disabled={pageBusy} onClick={continuePageSelection}>{pageBusy ? 'Saving…' : 'Continue to page selection'}</Button>
              {pageMsg && <p className="text-sm text-muted-foreground">{pageMsg}</p>}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { window.location.href = '/integrations'; }}>Back to Integrations</Button>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
}

export default function InstagramCallbackPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <InstagramCallbackInner />
    </Suspense>
  );
}
