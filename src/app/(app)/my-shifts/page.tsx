import type { Metadata } from 'next';

import { pageAccess } from '@/lib/access/guards';
import { loadMyShifts } from '@/lib/swaps/service';
import { PageHeader } from '@/lib/ui/PageHeader';

import { ShiftCard } from './_components/ShiftCard';

export const metadata: Metadata = { title: 'My shifts · Café rota' };

export default async function MyShiftsPage() {
  const { user } = await pageAccess('STAFF');
  const { shifts, colleagues } = await loadMyShifts(user.id);

  return (
    <>
      <PageHeader title="My shifts" />
      {shifts.length === 0 ? (
        <div className="cafe-empty">
          <p>
            No shifts published for you yet. When your manager publishes a week, your shifts appear
            here.
          </p>
        </div>
      ) : (
        <ol className="cafe-shifts" aria-label="Your shifts, soonest first">
          {shifts.map((shift, index) => (
            <ShiftCard key={shift.id} shift={shift} isNext={index === 0} colleagues={colleagues} />
          ))}
        </ol>
      )}
    </>
  );
}
