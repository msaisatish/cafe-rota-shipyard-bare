import type { Metadata } from 'next';

import { pageAccess } from '@/lib/access/guards';
import { listStaff } from '@/lib/staff/service';
import { PageHeader } from '@/lib/ui/PageHeader';

import { AddStaffDialog } from './_components/AddStaffDialog';
import { StaffTable } from './_components/StaffTable';

export const metadata: Metadata = { title: 'Staff · Café rota' };

export default async function StaffPage() {
  const { member } = await pageAccess('MANAGER');
  const staff = await listStaff();
  const others = staff.filter((person) => !person.isManager);

  return (
    <>
      <PageHeader title="Staff" actions={<AddStaffDialog />} />
      <p className="cafe-note">
        Give each new person their email and starting password. They choose their own password the
        first time they sign in.
      </p>
      {others.length === 0 ? (
        <div className="cafe-empty">
          <p>Nobody else is on the staff yet. Add the first person with “Add a staff member”.</p>
        </div>
      ) : null}
      <StaffTable staff={staff} myMemberId={member.id} />
    </>
  );
}
