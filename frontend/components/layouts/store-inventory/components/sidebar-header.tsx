import { ChevronFirst } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLayout } from './context';

export function SidebarHeader() {
  const { sidebarCollapse, setSidebarCollapse } = useLayout();

  const handleToggleClick = () => {
    setSidebarCollapse(!sidebarCollapse);
  };

  return (
    <div className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0">
      <Link href="/launches" className="flex items-center">
        <span className="default-logo text-lg font-bold tracking-tight text-foreground whitespace-nowrap">
          PostizMetro
        </span>
        <span className="small-logo text-lg font-bold text-foreground">
          PM
        </span>
      </Link>
      <Button
        onClick={handleToggleClick}
        size="sm"
        mode="icon"
        variant="outline"
        className={cn(
          'size-7 absolute start-full top-2/4 rtl:translate-x-2/4 -translate-x-2/4 -translate-y-2/4',
          sidebarCollapse ? 'ltr:rotate-180' : 'rtl:rotate-180',
        )}
      >
        <ChevronFirst className="size-4!" />
      </Button>
    </div>
  );
}
