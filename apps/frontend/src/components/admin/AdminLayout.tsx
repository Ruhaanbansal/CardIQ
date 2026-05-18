'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin',                label: 'Dashboard',      icon: '⊞' },
  { href: '/admin/cards',          label: 'Cards',          icon: '💳' },
  { href: '/admin/rules',          label: 'Reward Rules',   icon: '⚙' },
  { href: '/admin/merchants',      label: 'Merchants',      icon: '🏪' },
  { href: '/admin/scrapers',       label: 'Scrapers',       icon: '🕷' },
  { href: '/admin/feature-flags',  label: 'Feature Flags',  icon: '🚩' },
  { href: '/admin/audit',          label: 'Audit Log',      icon: '📋' },
  { href: '/admin/moderation',     label: 'Moderation',     icon: '🛡' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">CardIQ</p>
        <p className="text-lg font-black text-white">Admin Console</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-xs text-gray-500">Phase 9 — Internal Ops</p>
      </div>
    </aside>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
