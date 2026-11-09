'use client';

import { useCallback, useState, type FormEvent } from 'react';

import { Dialog } from '@/components/ui_blocks/Dialog';
import { Button } from '@/components/ui_foundation/Button';
import { askForSwapSchema } from '@/lib/swaps/schema';
import { Field, describedBy } from '@/lib/ui/Field';
import { useAction } from '@/lib/ui/useAction';
import { validate } from '@/seams/validate';

export function AskSwapDialog({
  shiftId,
  shiftLabel,
  colleagues,
}: {
  shiftId: string;
  shiftLabel: string;
  colleagues: readonly { userId: string; name: string }[];
}) {
  const [isOpen, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { isBusy, error, send, clearError } = useAction();

  const close = useCallback(() => {
    setOpen(false);
    setErrors({});
    clearError();
  }, [clearError]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const ask = validate(askForSwapSchema, { shiftId, ...form });
    if (!ask.ok) {
      setErrors(ask.fieldErrors);
      return;
    }
    const result = await send('/api/swaps', 'POST', ask.data);
    if (result.isDone) close();
    else setErrors(result.fieldErrors);
  }

  if (colleagues.length === 0) {
    return <span className="cafe-note">Nobody else is on the staff to swap with yet.</span>;
  }

  return (
    <>
      <Button label={`Ask to swap ${shiftLabel}`} onClick={() => setOpen(true)}>
        Ask to swap
      </Button>
      {isOpen ? (
        <Dialog kind="form" title={`Swap ${shiftLabel}`} onClose={close}>
          <form className="cafe-form" onSubmit={submit} noValidate>
            <p className="cafe-note">
              Your manager approves or turns it down. Until then the shift stays yours.
            </p>
            <Field id="swap-colleague" label="Who would take it?" error={errors.toUserId}>
              <select
                name="toUserId"
                defaultValue=""
                {...describedBy('swap-colleague', { error: errors.toUserId })}
              >
                <option value="" disabled>
                  Choose a colleague
                </option>
                {colleagues.map((colleague) => (
                  <option key={colleague.userId} value={colleague.userId}>
                    {colleague.name}
                  </option>
                ))}
              </select>
            </Field>
            {error ? (
              <p className="cafe-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="cafe-row-actions">
              <button type="submit" className="ui-button ui-button-primary" aria-busy={isBusy}>
                {isBusy ? 'Sending…' : 'Send the request'}
              </button>
              <Button onClick={close}>Cancel</Button>
            </div>
          </form>
        </Dialog>
      ) : null}
    </>
  );
}
