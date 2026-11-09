import { redirect } from 'next/navigation';

import { pageAccess } from '@/lib/access/guards';
import { homeFor } from '@/lib/access/rules';

/** The front door: the manager goes to the plan, staff to their own shifts. */
export default async function Home() {
  const { member } = await pageAccess();
  redirect(homeFor(member.role));
}
