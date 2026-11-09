'use client';

import { Button } from '@/components/ui_foundation/Button';
import { useAction } from '@/lib/ui/useAction';

export function DecideSwapButtons({ swapId, what }: { swapId: string; what: string }) {
  const { isBusy, error, send } = useAction();
  const decide = (decision: 'approve' | 'turn-down') =>
    send(`/api/swaps/${swapId}`, 'POST', { decision });

  return (
    <span className="cafe-row-actions">
      <Button label={`Approve swap: ${what}`} busy={isBusy} onClick={() => decide('approve')}>
        Approve
      </Button>
      <Button label={`Turn down swap: ${what}`} busy={isBusy} onClick={() => decide('turn-down')}>
        Turn down
      </Button>
      {error ? (
        <span className="cafe-error" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
