'use client';

import { useCallback, useState } from 'react';

import { Dialog } from '@/components/ui_blocks/Dialog';
import { Button } from '@/components/ui_foundation/Button';
import { useAction } from '@/lib/ui/useAction';

export function RemoveStaffButton({ memberId, name }: { memberId: string; name: string }) {
  const [isOpen, setOpen] = useState(false);
  const { isBusy, error, send, clearError } = useAction();

  const close = useCallback(() => {
    setOpen(false);
    clearError();
  }, [clearError]);

  async function remove() {
    const result = await send(`/api/staff/${memberId}`, 'DELETE');
    if (result.isDone) close();
  }

  return (
    <>
      <Button tone="quiet" label={`Remove ${name}`} onClick={() => setOpen(true)}>
        Remove
      </Button>
      {isOpen ? (
        <Dialog
          kind="confirm"
          title={`Remove ${name}?`}
          onClose={close}
          actions={
            <>
              <Button onClick={close}>Keep them</Button>
              <Button tone="danger" busy={isBusy} onClick={remove}>
                {isBusy ? 'Removing…' : `Remove ${name}`}
              </Button>
            </>
          }
        >
          <p>They can no longer sign in, and their upcoming shifts come off the rota.</p>
          {error ? (
            <p className="cafe-error" role="alert">
              {error}
            </p>
          ) : null}
        </Dialog>
      ) : null}
    </>
  );
}
