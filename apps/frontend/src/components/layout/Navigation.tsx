'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Zap, LayoutDashboard, Settings, CreditCard, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useTheme } from 'next-themes';

const ROUTES = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/recommendation', label: 'Card Match', icon: Compass },
  { href: '/optimizer', label: 'Optimizer', icon: Zap },
  { href: '/portfolio', label: 'My Cards', icon: CreditCard },
  { href: '/ai', label: 'AI Insights', icon: LayoutDashboard },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0", className)}>
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-fintech-points">CardIQ</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu</div>
        {ROUTES.map((route) => {
          const isActive = pathname.startsWith(route.href);
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname.startsWith('/settings') 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}

export function Header({ toggleMobileNav }: { toggleMobileNav?: () => void }) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        {toggleMobileNav && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileNav}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-lg font-semibold tracking-tight md:hidden">CardIQ</h2>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full"
        >
          <span className="sr-only">Toggle theme</span>
          {/* Theme icon logic would go here, omitting for brevity */}
          <span className="text-xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
        </Button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-fintech-points flex items-center justify-center text-white font-bold text-xs">
          JD
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  const bottomRoutes = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/recommendation', label: 'Cards', icon: Compass },
    { href: '/optimizer', label: 'Optimize', icon: Zap },
    { href: '/ai', label: 'AI', icon: LayoutDashboard },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/90 backdrop-blur-md pb-safe z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {bottomRoutes.map((route) => {
          const isActive = pathname.startsWith(route.href);
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <route.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{route.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
