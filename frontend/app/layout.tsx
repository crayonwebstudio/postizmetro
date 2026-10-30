import { ReactNode, Suspense } from 'react';
import { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import '@/styles/globals.css';

const inter = localFont({ src: './fonts/inter-latin-wght-normal.woff2', weight: '100 900', display: 'swap' });

export const metadata: Metadata = {
  title: {
    template: '%s | Metronic',
    default: 'Metronic', // a default is required when creating a template
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          'antialiased flex h-full text-base text-foreground bg-background',
          inter.className,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          storageKey="nextjs-theme"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <TooltipProvider delayDuration={0}>
            <Suspense>{children}</Suspense>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
