'use client';

import { Button } from '@/components/ui_foundation/Button';
import { useAction } from '@/lib/ui/useAction';

export function PublishWeekButton({ weekStart }: { weekStart: string }) {
  const { isBusy, error, send } = useAction();
  return (
    <>
      <Button
        tone="primary"
        busy={isBusy}
        onClick={() => send('/api/rota/publish', 'POST', { weekStart })}
      >
        {isBusy ? 'Publishing…' : 'Publish this week'}
      </Button>
      {error ? (
        <span className="cafe-error" role="alert">
          {error}
        </span>
      ) : null}
    </>
  );
}
