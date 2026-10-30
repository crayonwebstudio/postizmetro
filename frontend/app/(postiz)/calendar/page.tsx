'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Page, Empty, ErrorBox, ListCard, Row, StateBadge, asArray, useApi } from '@/components/postiz/ui';
import { get, post, put, del, uploadMedia } from '@/lib/postiz';

import { EventCalendar } from '@/components/ui/calendar/event-calendar';
import { LayoutProvider as CalendarLayoutProvider } from '@/components/layouts/calendar/components/context';
import type { CalendarEvent } from '@/components/ui/calendar/types';
export default function CalendarPage() {
  const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(); const end = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
  const { data, error, loading, refresh } = useApi(() => get(`/posts?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`));
  const events: CalendarEvent[] = asArray(data).filter((p: any) => p.publishDate).map((p: any, i: number) => ({ id: String(p.id), title: (p.content?.[0]?.content || 'Post').slice(0, 60), start: new Date(p.publishDate), end: new Date(new Date(p.publishDate).getTime() + 30 * 60000), color: (['sky', 'amber', 'violet', 'rose', 'emerald', 'orange'] as const)[i % 6] }));
  async function onUpdate(ev: CalendarEvent) {
    try { await put(`/posts/${ev.id}/date`, { date: ev.start.toISOString() }); refresh(); } catch (e: any) { alert(e.message); }
  }
  return (
    <Page title="Calendar" description="Metronic calendar mapped from Postiz posts. Dragging a post calls PUT /posts/:id/date on the backend, it does not only move locally.">
      {error && <ErrorBox error={error} />}
      {loading && <Empty text="Loading calendar..." />}
      {!loading && events.length === 0 && !error && <Empty text="No scheduled posts with a publish date in this range." />}
      <CalendarLayoutProvider><EventCalendar events={events} onEventUpdate={onUpdate} /></CalendarLayoutProvider>
    </Page>
  );
}
