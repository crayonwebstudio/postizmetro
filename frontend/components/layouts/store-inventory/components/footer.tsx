import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container-fluid">
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-3 py-5">
          <div className="flex order-2 md:order-1  gap-2 font-normal text-sm">
            <span className="text-muted-foreground">{currentYear} &copy;</span>
            <span className="text-secondary-foreground">
              PostizMetro review, no login
            </span>
          </div>
          <nav className="flex order-1 md:order-2 gap-4 font-normal text-sm text-muted-foreground">
            <Link href="/launches" className="hover:text-primary">
              Launches
            </Link>
            <Link href="/integrations" className="hover:text-primary">
              Integrations
            </Link>
            <Link href="/settings" className="hover:text-primary">
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
