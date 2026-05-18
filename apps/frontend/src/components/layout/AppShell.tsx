'use client';

import * as React from 'react';
import { Sidebar, Header, MobileBottomNav } from './Navigation';
import { cn } from '../../lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  isPublic?: boolean;
}

export function AppShell({ children, className, isPublic = false }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  if (isPublic) {
    return <main className={cn("min-h-screen bg-background", className)}>{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar className="hidden md:flex" />
      
      <div className="flex-1 flex flex-col min-h-screen w-full md:max-w-[calc(100vw-16rem)]">
        <Header toggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)} />
        
        <main className={cn("flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8", className)}>
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
