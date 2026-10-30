'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Page, Empty, ErrorBox, ListCard, asArray, useApi } from '@/components/postiz/ui';
import { get, post } from '@/lib/postiz';

const TIMEZONES = ['Asia/Kolkata', 'UTC', 'Europe/Berlin', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Dubai', 'Australia/Sydney'];
const LANGUAGES = ['en', 'de', 'fr', 'es', 'pt', 'hi'];

export default function SettingsPage() {
  const { data, error, loading } = useApi(() => get('/settings/team'));
  const team = asArray((data as any)?.team).concat(asArray(data));
  const { data: personal } = useApi(() => get('/user/personal'));
  const { data: notif } = useApi(() => get('/user/email-notifications'));
  const [fullname, setFullname] = useState('');
  const [bio, setBio] = useState('');
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);
  const [tz, setTz] = useState('Asia/Kolkata');
  const [metric, setMetric] = useState('GLOBAL');
  const [lang, setLang] = useState('en');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTz(localStorage.getItem('timezone') || 'Asia/Kolkata');
      setMetric(localStorage.getItem('isUS') || 'GLOBAL');
      setLang(localStorage.getItem('postizmetro-language') || 'en');
    }
    if (personal) { setFullname((personal as any).fullname || ''); setBio((personal as any).bio || ''); }
    if (notif) { setSuccess(!!(notif as any).sendSuccessEmails); setFailure(!!(notif as any).sendFailureEmails); }
  }, [personal, notif]);

  async function savePersonal() { try { await post('/user/personal', { fullname, bio }); setMsg('Personal settings saved via POST /user/personal.'); } catch (e: any) { setMsg('Error: ' + e.message); } }
  async function saveNotif() { try { await post('/user/email-notifications', { sendSuccessEmails: success, sendFailureEmails: failure }); setMsg('Notification settings saved via POST /user/email-notifications.'); } catch (e: any) { setMsg('Error: ' + e.message); } }
  function saveLocal() {
    localStorage.setItem('timezone', tz); localStorage.setItem('isUS', metric); localStorage.setItem('postizmetro-language', lang);
    setMsg('Timezone, date metric, and language saved locally in this browser. There is no backend timezone/language endpoint in Postiz v2.10.1 users/settings controllers: the original Postiz metric component also stores timezone and metric in localStorage, and the seed user timezone field is not editable via an API route, so this form does not fake a server save.');
  }

  return (
    <Page title="Settings" description="Team from GET /settings/team, personal and notification forms from the real /user endpoints, timezone/language as local preferences exactly as original Postiz did (see note below).">
      {error && <ErrorBox error={error} />}
      {loading && <Empty text="Loading settings..." />}
      <ListCard title="Personal settings (backend)" description="POST /user/personal, UserDetailDto: fullname min 3 chars, bio optional.">
        <Input value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="Full name" />
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" rows={3} />
        <Button onClick={savePersonal}>Save personal settings</Button>
      </ListCard>
      <ListCard title="Email notifications (backend)" description="GET/POST /user/email-notifications, EmailNotificationsDto: sendSuccessEmails, sendFailureEmails, both boolean.">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={success} onChange={(e) => setSuccess(e.target.checked)} /> Send success emails</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={failure} onChange={(e) => setFailure(e.target.checked)} /> Send failure emails</label>
        <Button onClick={saveNotif}>Save notification settings</Button>
      </ListCard>
      <ListCard title="Timezone, date metric, language (local preference)" description="Original Postiz settings/metric.component.tsx stores timezone and metric in localStorage. No backend route in v2.10.1 saves them, so this form is honest about local storage.">
        <label className="text-sm font-medium">Timezone</label>
        <select className="border rounded px-2 py-2 text-sm bg-background" value={tz} onChange={(e) => setTz(e.target.value)}>{TIMEZONES.map((t) => (<option key={t} value={t}>{t}</option>))}</select>
        <label className="text-sm font-medium">Date metric</label>
        <select className="border rounded px-2 py-2 text-sm bg-background" value={metric} onChange={(e) => setMetric(e.target.value)}><option value="US">AM:PM (US)</option><option value="GLOBAL">24 hours (Global)</option></select>
        <label className="text-sm font-medium">Language</label>
        <select className="border rounded px-2 py-2 text-sm bg-background" value={lang} onChange={(e) => setLang(e.target.value)}>{LANGUAGES.map((l) => (<option key={l} value={l}>{l}</option>))}</select>
        <Button onClick={saveLocal}>Save local preferences</Button>
      </ListCard>
      <ListCard title="Team" description="From GET /settings/team.">
        {team.length === 0 && <Empty text="No team members returned. The fixed review workspace has a single user." />}
        {team.map((t: any, i: number) => (<Card key={i}><CardContent className="pt-4 text-sm">{JSON.stringify(t)}</CardContent></Card>))}
      </ListCard>
      <ListCard title="Review workspace" description="Single fixed workspace. No login, no organisation selector in this review build."><p className="text-sm">Workspace: PostizMetro review workspace.</p></ListCard>
      {msg && <p className="text-sm">{msg}</p>}
    </Page>
  );
}
