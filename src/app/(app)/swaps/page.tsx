import type { Metadata } from 'next';

import { pageAccess } from '@/lib/access/guards';
import { listSwapRequests } from '@/lib/swaps/service';
import { PageHeader } from '@/lib/ui/PageHeader';

import { SwapTable } from './_components/SwapTable';

export const metadata: Metadata = { title: 'Swap requests · Café rota' };

export default async function SwapRequestsPage() {
  await pageAccess('MANAGER');
  const requests = await listSwapRequests();

  return (
    <>
      <PageHeader title="Swap requests" />
      {requests.length === 0 ? (
        <div className="cafe-empty">
          <p>
            No swap requests. When someone asks to swap a shift, it appears here for you to approve.
          </p>
        </div>
      ) : (
        <>
          <p className="cafe-note">Approving moves the shift to the colleague straight away.</p>
          <SwapTable requests={requests} />
        </>
      )}
    </>
  );
}
