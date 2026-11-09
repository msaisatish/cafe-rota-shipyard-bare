'use client';

import { DataTable } from '@/components/data_table/DataTable';
import { Status } from '@/components/ui_foundation/Status';
import type { StaffRow } from '@/lib/staff/service';

import { RemoveStaffButton } from './RemoveStaffButton';

export function StaffTable({
  staff,
  myMemberId,
}: {
  staff: readonly StaffRow[];
  myMemberId: string;
}) {
  const rows = staff.map((person) => ({
    name: person.name,
    email: person.email,
    role: person.isManager ? 'Manager' : 'Staff',
    password: person.hasOwnPassword ? (
      <Status tone="ok" label="Own password" />
    ) : (
      <Status tone="warn" label="Starting password" />
    ),
    actions:
      person.memberId === myMemberId ? null : (
        <RemoveStaffButton memberId={person.memberId} name={person.name} />
      ),
  }));
  return (
    <DataTable
      caption="Everyone who works at the café"
      rows={rows}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'password', label: 'Password', sortable: false },
        { key: 'actions', label: 'Change', sortable: false },
      ]}
    />
  );
}
