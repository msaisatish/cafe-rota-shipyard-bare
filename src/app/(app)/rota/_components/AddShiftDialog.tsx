'use client';

import { useCallback, useState, type FormEvent } from 'react';

import { Dialog } from '@/components/ui_blocks/Dialog';
import { Button } from '@/components/ui_foundation/Button';
import { newShiftSchema } from '@/lib/rota/schema';
import { Field, describedBy } from '@/lib/ui/Field';
import { useAction } from '@/lib/ui/useAction';
import { validate } from '@/seams/validate';

interface Option {
  value: string;
  label: string;
}

export function AddShiftDialog({
  weekStart,
  days,
  people,
}: {
  weekStart: string;
  days: readonly Option[];
  people: readonly { userId: string; name: string }[];
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
    const form = new FormData(event.currentTarget);
    const shift = validate(newShiftSchema, { weekStart, ...Object.fromEntries(form) });
    if (!shift.ok) {
      setErrors(shift.fieldErrors);
      return;
    }
    setErrors({});
    const result = await send('/api/rota/shifts', 'POST', shift.data);
    if (result.isDone) close();
    else setErrors(result.fieldErrors);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add a shift</Button>
      {isOpen ? (
        <Dialog kind="form" title="Add a shift" onClose={close}>
          <form className="cafe-form" onSubmit={submit} noValidate>
            <Field id="shift-day" label="Day" error={errors.day}>
              <select name="day" {...describedBy('shift-day', { error: errors.day })}>
                {days.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="shift-start" label="Starts" error={errors.start}>
              <input
                name="start"
                type="time"
                defaultValue="07:00"
                {...describedBy('shift-start', { error: errors.start })}
              />
            </Field>
            <Field id="shift-end" label="Ends" error={errors.end}>
              <input
                name="end"
                type="time"
                defaultValue="15:00"
                {...describedBy('shift-end', { error: errors.end })}
              />
            </Field>
            <Field id="shift-person" label="Who is working" error={errors.userId}>
              <select name="userId" {...describedBy('shift-person', { error: errors.userId })}>
                {people.map((person) => (
                  <option key={person.userId} value={person.userId}>
                    {person.name}
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
                {isBusy ? 'Saving…' : 'Add shift'}
              </button>
              <Button onClick={close}>Cancel</Button>
            </div>
          </form>
        </Dialog>
      ) : null}
    </>
  );
}
