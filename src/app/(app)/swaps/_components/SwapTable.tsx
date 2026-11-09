'use client';

import { DataTable } from '@/components/data_table/DataTable';
import { Status } from '@/components/ui_foundation/Status';
import { SWAP_STATUS_LABEL } from '@/lib/swaps/rules';
import type { SwapRow } from '@/lib/swaps/service';

import { DecideSwapButtons } from './DecideSwapButtons';

const TONE = { WAITING: 'warn', APPROVED: 'ok', TURNED_DOWN: 'danger' } as const;

export function SwapTable({ requests }: { requests: readonly SwapRow[] }) {
  const rows = requests.map((request) => ({
    shift: request.shift,
    from: request.from,
    to: request.to,
    askedOn: request.askedOn,
    status: <Status tone={TONE[request.status]} label={SWAP_STATUS_LABEL[request.status]} />,
    actions:
      request.status === 'WAITING' ? (
        <DecideSwapButtons swapId={request.id} what={`${request.from} to ${request.to}`} />
      ) : null,
  }));
  return (
    <DataTable
      caption="Swap requests, waiting ones first"
      rows={rows}
      columns={[
        { key: 'shift', label: 'Shift', sortable: false },
        { key: 'from', label: 'From' },
        { key: 'to', label: 'To' },
        { key: 'askedOn', label: 'Asked', sortable: false },
        { key: 'status', label: 'Status', sortable: false },
        { key: 'actions', label: 'Decide', sortable: false },
      ]}
    />
  );
}
