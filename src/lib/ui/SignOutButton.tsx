'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui_foundation/Button';

export function SignOutButton() {
  const router = useRouter();
  const [isBusy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setBusy(true);
    setError(null);
    const response = await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    setBusy(false);
    if (!response?.ok) {
      setError('Could not sign you out. Try again.');
      return;
    }
    router.refresh();
    router.push('/sign-in');
  }

  return (
    <>
      <Button tone="quiet" busy={isBusy} onClick={signOut}>
        {isBusy ? 'Signing out…' : 'Sign out'}
      </Button>
      {error ? <span className="cafe-error">{error}</span> : null}
    </>
  );
}
