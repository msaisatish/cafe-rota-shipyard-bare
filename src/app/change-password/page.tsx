import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { currentUser } from '@/components/auth/current-user';
import { memberForUser } from '@/lib/access/service';

import { OwnPasswordForm } from './OwnPasswordForm';

import '@/lib/ui/cafe.css';

export const metadata: Metadata = { title: 'Choose your own password · Café rota' };

/** Where someone with a starting password lands before anything else. */
export default async function ChangePasswordPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  const member = await memberForUser(user.id);
  if (!member) redirect('/not-on-staff');
  if (!member.mustChangePassword) redirect('/');

  return (
    <main className="cafe-plain">
      <h1>Choose your own password</h1>
      <p className="cafe-note">
        Your manager set a starting password for you. Pick one only you know before you see your
        shifts.
      </p>
      <OwnPasswordForm />
    </main>
  );
}
