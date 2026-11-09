import Link from 'next/link';

import { addDays } from '@/lib/cafe/dates';

export function WeekNav({ weekStart }: { weekStart: string }) {
  return (
    <nav className="cafe-week-nav" aria-label="Other weeks">
      <Link href={`/rota?week=${addDays(weekStart, -7)}`}>← Previous week</Link>
      <Link href={`/rota?week=${addDays(weekStart, 7)}`}>Next week →</Link>
    </nav>
  );
}
