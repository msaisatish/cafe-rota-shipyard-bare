'use client';

import { DataTable } from '@/components/data_table/DataTable';
import type { PlannedShift } from '@/lib/rota/service';

import { RemoveShiftButton } from './RemoveShiftButton';

export function ShiftTable({ shifts }: { shifts: readonly PlannedShift[] }) {
  const rows = shifts.map((shift) => ({
    day: shift.dayLabel,
    time: <span className="cafe-time">{shift.time}</span>,
    who: shift.personName,
    actions: (
      <RemoveShiftButton shiftId={shift.id} what={`${shift.personName}, ${shift.dayLabel}`} />
    ),
  }));
  return (
    <DataTable
      caption="Shifts this week, by day"
      rows={rows}
      pageSize={50}
      columns={[
        { key: 'day', label: 'Day', sortable: false },
        { key: 'time', label: 'Time', sortable: false },
        { key: 'who', label: 'Who' },
        { key: 'actions', label: 'Change', sortable: false },
      ]}
    />
  );
}
