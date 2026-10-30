'use client';
import { DefaultLayout } from '@/components/layouts/store-inventory';
export default function PostizLayout({ children }: { children: React.ReactNode }) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
