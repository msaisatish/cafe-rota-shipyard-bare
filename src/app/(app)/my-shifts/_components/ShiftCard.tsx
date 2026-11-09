import { Status } from '@/components/ui_foundation/Status';
import type { MyShift } from '@/lib/swaps/service';

import { AskSwapDialog } from './AskSwapDialog';

interface Colleague {
  userId: string;
  name: string;
}

export function ShiftCard({
  shift,
  isNext,
  colleagues,
}: {
  shift: MyShift;
  isNext: boolean;
  colleagues: readonly Colleague[];
}) {
  const isWaiting = shift.lastAsk?.status === 'WAITING';
  const isTurnedDown = shift.lastAsk?.status === 'TURNED_DOWN';

  return (
    <li className={isNext ? 'cafe-shift is-next' : 'cafe-shift'}>
      <h2>
        {isNext ? 'Next: ' : ''}
        {shift.dayLabel}
      </h2>
      <p className="cafe-shift-time">{shift.time}</p>
      <div className="cafe-shift-footer">
        {isWaiting ? (
          <Status tone="warn" label={`Waiting: swap with ${shift.lastAsk?.colleague}`} />
        ) : (
          <>
            {isTurnedDown ? (
              <Status tone="danger" label={`Swap with ${shift.lastAsk?.colleague} turned down`} />
            ) : null}
            <AskSwapDialog shiftId={shift.id} shiftLabel={shift.dayLabel} colleagues={colleagues} />
          </>
        )}
      </div>
    </li>
  );
}
