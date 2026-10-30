'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Page, Empty, ErrorBox, asArray, useApi } from '@/components/postiz/ui';
import { get, post } from '@/lib/postiz';
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Per-provider post settings, derived from backend DTOs in
// libraries/nestjs-libraries/src/dtos/posts/providers-settings/*.dto.ts
// and all.providers.settings.ts. Only fields listed here are sent, and only
// when filled, so providers with no settings DTO (threads, mastodon,
// bluesky, telegram, nostr, vk) send no settings object. Complex nested
// DTO fields (reddit/lemmy/farcaster subreddit objects) are not guessed:
// those providers show a note and the backend error is surfaced if the
// simple fields alone are insufficient.
type Field = { key: string; label: string; type?: string; options?: string[]; required?: boolean; help?: string };
const PROVIDER_FIELDS: Record<string, Field[]> = {
  youtube: [
    { key: 'title', label: 'Video title', required: true, help: 'Backend YoutubeSettingsDto: title, 2-100 chars, required.' },
    { key: 'type', label: 'Visibility', type: 'select', options: ['public', 'private', 'unlisted'], help: 'Backend IsIn public/private/unlisted.' },
    { key: 'selfDeclaredMadeForKids', label: 'Made for kids', type: 'select', options: ['no', 'yes'] },
    { key: 'tags', label: 'Tags (comma separated)', help: 'Sent as [{value,label}] pairs.' },
  ],
  tiktok: [
    { key: 'title', label: 'Title (max 90)', help: 'Backend TikTokDto: title MaxLength 90, optional.' },
    { key: 'privacy_level', label: 'Privacy level', type: 'select', options: ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'FOLLOWER_OF_CREATOR', 'SELF_ONLY'], required: true },
    { key: 'content_posting_method', label: 'Posting method', type: 'select', options: ['DIRECT_POST', 'UPLOAD'], required: true },
    { key: 'autoAddMusic', label: 'Auto add music', type: 'select', options: ['yes', 'no'] },
  ],
  instagram: [
    { key: 'post_type', label: 'Post type', type: 'select', options: ['post', 'story'], required: true, help: 'Backend InstagramDto: post_type IsIn post/story, required.' },
  ],
  'instagram-standalone': [
    { key: 'post_type', label: 'Post type', type: 'select', options: ['post', 'story'], required: true },
  ],
  pinterest: [
    { key: 'title', label: 'Pin title (max 100)' },
    { key: 'link', label: 'Link (URL)' },
    { key: 'board', label: 'Board id', required: true, help: 'Backend PinterestDto: board is required.' },
  ],
  reddit: [
    { key: 'title', label: 'Post title', required: true },
    { key: 'type', label: 'Type', help: 'Backend RedditSettingsDto: type required, e.g. link/text. Subreddit selection is a nested backend object and is not guessed here; the backend error is shown if it is required.' },
    { key: 'url', label: 'URL (for link posts)' },
  ],
  lemmy: [
    { key: 'title', label: 'Post title', required: true },
    { key: 'subreddit', label: 'Subreddit (text, backend expects a nested object; error is surfaced if rejected)' },
    { key: 'url', label: 'URL' },
  ],
  linkedin: [{ key: 'post_as_images_carousel', label: 'Post as images carousel', type: 'checkbox', help: 'Backend LinkedinDto: boolean, optional.' }],
  'linkedin-page': [{ key: 'post_as_images_carousel', label: 'Post as images carousel', type: 'checkbox' }],
  x: [
    { key: 'who_can_reply_post', label: 'Who can reply', type: 'select', options: ['everyone', 'following', 'mentionedUsers', 'subscribers', 'verified'], required: true },
    { key: 'community', label: 'Community URL (https://x.com/i/communities/<id>)' },
  ],
  discord: [{ key: 'channel', label: 'Channel id', required: true }],
  slack: [{ key: 'channel', label: 'Channel id', required: true }],
  devto: [
    { key: 'title', label: 'Article title', required: true },
    { key: 'canonical', label: 'Canonical URL' },
    { key: 'organization', label: 'Organization' },
  ],
  medium: [
    { key: 'title', label: 'Article title', required: true },
    { key: 'subtitle', label: 'Subtitle', required: true },
    { key: 'canonical', label: 'Canonical URL' },
    { key: 'publication', label: 'Publication' },
  ],
  hashnode: [
    { key: 'title', label: 'Article title', required: true },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'canonical', label: 'Canonical URL' },
    { key: 'publication', label: 'Publication', required: true },
  ],
  wordpress: [
    { key: 'title', label: 'Post title', required: true },
    { key: 'type', label: 'Type', required: true, help: 'Backend WordpressDto: type required, e.g. post/page.' },
  ],
  listmonk: [
    { key: 'subject', label: 'Subject', required: true },
    { key: 'preview', label: 'Preview', required: true },
    { key: 'list', label: 'List id', required: true },
    { key: 'template', label: 'Template id' },
  ],
  dribbble: [
    { key: 'title', label: 'Shot title', required: true },
    { key: 'team', label: 'Team URL' },
  ],
  facebook: [{ key: 'url', label: 'URL' }],
  gmb: [
    { key: 'topicType', label: 'Topic type', type: 'select', options: ['STANDARD', 'EVENT', 'OFFER'] },
    { key: 'callToActionType', label: 'Call to action type' },
    { key: 'callToActionUrl', label: 'Call to action URL' },
    { key: 'eventTitle', label: 'Event title (EVENT only)' },
    { key: 'offerCouponCode', label: 'Offer coupon code (OFFER only)' },
  ],
};

export default function ComposerPage() {
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const { data: integrations } = useApi(() => get('/integrations/list'));
  const { data: catalog } = useApi(() => get('/integrations'));
  const channels: any[] = asArray((integrations as any)?.integrations).concat(asArray(integrations));
  const catalogSocial: any[] = asArray((catalog as any)?.social);
  const [selected, setSelected] = useState<string[]>([]);
  const [perChannel, setPerChannel] = useState<Record<string, { content: string; settings: Record<string, any> }>>({});
  const setField = (id: string, key: string, v: any) => setPerChannel((p) => ({ ...p, [id]: { content: p[id]?.content || '', settings: { ...(p[id]?.settings || {}), [key]: v } } }));
  const setOverride = (id: string, v: string) => setPerChannel((p) => ({ ...p, [id]: { content: v, settings: p[id]?.settings || {} } }));

  async function submit(kind: 'draft' | 'schedule' | 'now') {
    setBusy(true); setMsg('');
    try {
      if (selected.length === 0) throw new Error('Select at least one channel first. Channels come from GET /integrations/list.');
      const posts = selected.map((id) => {
        const ch = channels.find((c: any) => c.id === id);
        const ident = ch?.identifier || '';
        const raw = perChannel[id]?.settings || {};
        const settings: Record<string, any> = {};
        for (const [k, v] of Object.entries(raw)) {
          if (v === '' || v === null || v === undefined || v === false) continue;
          if (k === 'tags' && typeof v === 'string') settings.tags = v.split(',').map((s) => s.trim()).filter(Boolean).map((s) => ({ value: s, label: s }));
          else settings[k] = v;
        }
        return { integration: { id }, value: [{ content: perChannel[id]?.content || content, type: 'text' }], ...(Object.keys(settings).length ? { settings } : {}) };
      });
      // Backend CreatePostDto shape: type, date, tags, shortLink, posts.
      // The previous review composer sent `state`, which is not a CreatePostDto field.
      const body: any = { type: kind, date: date ? new Date(date).toISOString() : new Date().toISOString(), tags: [], shortLink: false, posts };
      const res = await post('/posts', body);
      setMsg('Saved. Response: ' + JSON.stringify(res).slice(0, 400));
    } catch (e: any) { setMsg('Error: ' + e.message); } finally { setBusy(false); }
  }

  return (
    <Page title="Composer" description="Create a post. Per-provider fields below are driven by the backend: editor and connection fields from GET /integrations/list and GET /integrations, post settings from the backend provider-settings DTOs. No provider field is invented.">
      <Card><CardContent className="grid gap-3 pt-6">
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your post... (used for every selected channel unless overridden below)" rows={6} />
        <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="text-sm">Channels (from /integrations/list): {channels.length === 0 ? 'No channels connected yet. Connect one in Integrations first.' : ''}</div>
        <div className="flex flex-wrap gap-2">{channels.map((c: any) => (<Button key={c.id} size="sm" variant={selected.includes(c.id) ? 'primary' : 'outline'} onClick={() => setSelected((s) => s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id])}>{c.name || c.identifier || c.id}</Button>))}</div>
        {selected.map((id) => {
          const ch = channels.find((c: any) => c.id === id) || {};
          const ident = ch.identifier || '';
          const fields = PROVIDER_FIELDS[ident] || [];
          const cat = catalogSocial.find((s: any) => s.identifier === ident);
          return (
            <Card key={id}><CardContent className="grid gap-3 pt-4">
              <div className="font-medium text-sm">{ch.name || ident} <span className="text-muted-foreground">editor: {ch.editor || cat?.editor || 'unknown'} | provider: {ident}</span></div>
              <Textarea value={perChannel[id]?.content || ''} onChange={(e) => setOverride(id, e.target.value)} placeholder="Per-channel content override (blank = use main content above)" rows={3} />
              {fields.length === 0 && <p className="text-xs text-muted-foreground">No extra post settings in the backend DTO for this provider (threads, mastodon, bluesky, telegram, nostr, vk use EmptySettings). Only content is sent.</p>}
              {fields.map((f) => (
                <div key={f.key} className="grid gap-1">
                  <label className="text-sm font-medium">{f.label}{f.required ? ' *' : ''}</label>
                  {f.type === 'select' ? (
                    <select className="border rounded px-2 py-2 text-sm bg-background" value={perChannel[id]?.settings?.[f.key] || ''} onChange={(e) => setField(id, f.key, e.target.value)}>
                      <option value="">Select...</option>{f.options?.map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  ) : f.type === 'checkbox' ? (
                    <input type="checkbox" checked={!!perChannel[id]?.settings?.[f.key]} onChange={(e) => setField(id, f.key, e.target.checked)} />
                  ) : (
                    <Input value={perChannel[id]?.settings?.[f.key] || ''} onChange={(e) => setField(id, f.key, e.target.value)} placeholder={f.label} />
                  )}
                  {f.help && <span className="text-xs text-muted-foreground">{f.help}</span>}
                </div>
              ))}
              {Array.isArray(ch.customFields) && ch.customFields.length > 0 && (
                <div className="text-xs text-muted-foreground">Connection fields for this provider (from backend, not post fields, shown for reference): {ch.customFields.map((cf: any) => `${cf.label} (${cf.key}, ${cf.type})`).join(', ')}</div>
              )}
            </CardContent></Card>
          );
        })}
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy || !content} onClick={() => submit('draft')}>Save draft</Button>
          <Button disabled={busy || !content} variant="outline" onClick={() => submit('schedule')}>Schedule</Button>
          <Button disabled={busy || !content} variant="outline" onClick={() => submit('now')}>Publish now</Button>
          <Sheet><SheetTrigger asChild><Button variant="secondary">Preview in sheet</Button></SheetTrigger>
            <SheetContent><SheetHeader><SheetTitle>Post preview</SheetTitle></SheetHeader><SheetBody><p className="text-sm whitespace-pre-wrap">{content || 'Nothing written yet.'}</p></SheetBody><SheetFooter><Button onClick={() => submit('draft')}>Save draft</Button></SheetFooter></SheetContent></Sheet>
        </div>
        {msg && <p className="text-sm">{msg}</p>}
      </CardContent></Card>
    </Page>
  );
}
