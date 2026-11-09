import type { Metadata } from 'next';

import { Status } from '@/components/ui_foundation/Status';
import { pageAccess } from '@/lib/access/guards';
import { addDays, cafeToday, formatDay, mondayOf, weekDays } from '@/lib/cafe/dates';
import { loadWeekPlan } from '@/lib/rota/service';
import { weekQuerySchema } from '@/lib/rota/schema';
import { PageHeader } from '@/lib/ui/PageHeader';
import { validate } from '@/seams/validate';

import { AddShiftDialog } from './_components/AddShiftDialog';
import { PublishWeekButton } from './_components/PublishWeekButton';
import { ShiftTable } from './_components/ShiftTable';
import { WeekNav } from './_components/WeekNav';

export const metadata: Metadata = { title: 'Plan the week · Café rota' };

export default async function PlanTheWeekPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await pageAccess('MANAGER');
  const query = validate(weekQuerySchema, await searchParams);
  const asked = query.ok && query.data.week ? query.data.week : addDays(cafeToday(), 7);
  const weekStart = mondayOf(asked);
  const plan = await loadWeekPlan(weekStart);
  const days = weekDays(weekStart).map((day) => ({ value: day, label: formatDay(day) }));

  return (
    <>
      <PageHeader
        title={
          <>
            Week of {formatDay(weekStart)}
            <Status
              tone={plan.isPublished ? 'ok' : 'warn'}
              label={plan.isPublished ? 'Published' : 'Draft'}
            />
          </>
        }
        actions={
          <>
            <AddShiftDialog weekStart={weekStart} days={days} people={plan.people} />
            {plan.isPublished ? null : <PublishWeekButton weekStart={weekStart} />}
          </>
        }
      />
      <WeekNav weekStart={weekStart} />
      {plan.isPublished ? (
        <p className="cafe-note">Staff can see this week. Changes show straight away.</p>
      ) : (
        <p className="cafe-note">Staff cannot see this week until you publish it.</p>
      )}
      {plan.shifts.length === 0 ? (
        <div className="cafe-empty">
          <p>No shifts this week yet. Add the first one with “Add a shift”.</p>
        </div>
      ) : (
        <ShiftTable shifts={plan.shifts} />
      )}
    </>
  );
}
