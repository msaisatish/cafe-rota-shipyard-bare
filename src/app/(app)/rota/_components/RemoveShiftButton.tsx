'use client';

import { Button } from '@/components/ui_foundation/Button';
import { useAction } from '@/lib/ui/useAction';

export function RemoveShiftButton({ shiftId, what }: { shiftId: string; what: string }) {
  const { isBusy, error, send } = useAction();
  return (
    <span className="cafe-row-actions">
      <Button
        tone="quiet"
        busy={isBusy}
        aria-label={`Remove shift: ${what}`}
        onClick={() => send(`/api/rota/shifts/${shiftId}`, 'DELETE')}
      >
        {isBusy ? 'Removing…' : 'Remove'}
      </Button>
      {error ? (
        <span className="cafe-error" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
