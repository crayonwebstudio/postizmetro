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
    template: '%s | PostizMetro',
    default: 'PostizMetro', // a default is required when creating a template
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
          // demo1 sidebar-fixed header-fixed at first paint, not only after
          // Main.tsx useEffect runs. Without these, the fixed sidebar
          // overlaps the wrapper content and footer on initial load,
          // because .demo1.sidebar-fixed .wrapper padding is what offsets
          // content from the sidebar. Main.tsx still re-adds them.
          'antialiased flex h-full text-base text-foreground bg-background demo1 sidebar-fixed header-fixed',
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
