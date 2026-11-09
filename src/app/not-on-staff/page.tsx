import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { currentUser } from '@/components/auth/current-user';
import { memberForUser } from '@/lib/access/service';
import { SignOutButton } from '@/lib/ui/SignOutButton';

import '@/lib/ui/cafe.css';

export const metadata: Metadata = { title: 'Not on the staff list · Café rota' };

/** For an account that signed itself up but was never added by the manager. */
export default async function NotOnStaffPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  if (await memberForUser(user.id)) redirect('/');

  return (
    <main className="cafe-plain">
      <h1>You are not on the staff list yet</h1>
      <p>
        Ask your manager to add you. They will give you an email address and a starting password to
        sign in with.
      </p>
      <SignOutButton />
    </main>
  );
}
