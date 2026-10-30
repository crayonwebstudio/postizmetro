'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Page, Empty, ErrorBox, ListCard, Row, StateBadge, asArray, useApi } from '@/components/postiz/ui';
import { get, post, put, del, uploadMedia } from '@/lib/postiz';

export default function DisabledPage() {
  return (
    <Page title="Marketplace" description="Disabled in the PostizMetro review build. Marketplace and billing are gated to 410 on the backend in review mode, because there is no login and no Stripe configuration in this review build.">
      <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Disabled in the PostizMetro review build. Marketplace and billing are gated to 410 on the backend in review mode, because there is no login and no Stripe configuration in this review build.</CardContent></Card>
    </Page>
  );
}
