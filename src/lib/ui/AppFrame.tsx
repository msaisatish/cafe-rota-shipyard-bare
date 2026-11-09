'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { AppShell } from '@/components/ui_blocks/AppShell';
import type { NavItem } from '@/components/ui_blocks/blocks';

import { SignOutButton } from './SignOutButton';

import './cafe.css';

const MANAGER_NAV: NavItem[] = [
  { href: '/rota', label: 'Plan the week' },
  { href: '/staff', label: 'Staff' },
  { href: '/swaps', label: 'Swap requests' },
];

const STAFF_NAV: NavItem[] = [{ href: '/my-shifts', label: 'My shifts' }];

export function AppFrame({
  isManager,
  personName,
  children,
}: {
  isManager: boolean;
  personName: string;
  children: ReactNode;
}) {
  const path = usePathname();
  return (
    <AppShell items={isManager ? MANAGER_NAV : STAFF_NAV} path={path}>
      <div className="cafe-bar">
        <span className="cafe-name">Café rota</span>
        <span className="cafe-person">{personName}</span>
        <SignOutButton />
      </div>
      {children}
    </AppShell>
  );
}
