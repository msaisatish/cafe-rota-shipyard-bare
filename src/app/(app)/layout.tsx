import type { ReactNode } from 'react';

import { pageAccess } from '@/lib/access/guards';
import { displayName } from '@/lib/access/rules';
import { AppFrame } from '@/lib/ui/AppFrame';

export default async function SignedInLayout({ children }: { children: ReactNode }) {
  const { user, member } = await pageAccess();
  return (
    <AppFrame isManager={member.role === 'MANAGER'} personName={displayName(user)}>
      {children}
    </AppFrame>
  );
}
