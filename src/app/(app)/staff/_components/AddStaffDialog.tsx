'use client';

import { useCallback, useState, type FormEvent } from 'react';

import { Dialog } from '@/components/ui_blocks/Dialog';
import { Button } from '@/components/ui_foundation/Button';
import { newStaffSchema } from '@/lib/staff/schema';
import { Field, describedBy } from '@/lib/ui/Field';
import { useAction } from '@/lib/ui/useAction';
import { validate } from '@/seams/validate';

const PASSWORD_HINT =
  'At least 12 characters, mixing three of: small letters, capitals, numbers, symbols.';

export function AddStaffDialog() {
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
    const person = validate(newStaffSchema, Object.fromEntries(new FormData(event.currentTarget)));
    if (!person.ok) {
      setErrors(person.fieldErrors);
      return;
    }
    setErrors({});
    const result = await send('/api/staff', 'POST', person.data);
    if (result.isDone) close();
    else setErrors(result.fieldErrors);
  }

  return (
    <>
      <Button tone="primary" onClick={() => setOpen(true)}>
        Add a staff member
      </Button>
      {isOpen ? (
        <Dialog kind="form" title="Add a staff member" onClose={close}>
          <form className="cafe-form" onSubmit={submit} noValidate>
            <Field id="staff-name" label="Name" error={errors.name}>
              <input
                name="name"
                autoComplete="off"
                {...describedBy('staff-name', { error: errors.name })}
              />
            </Field>
            <Field id="staff-email" label="Email" error={errors.email}>
              <input
                name="email"
                type="email"
                autoComplete="off"
                {...describedBy('staff-email', { error: errors.email })}
              />
            </Field>
            <Field
              id="staff-password"
              label="Starting password"
              hint={PASSWORD_HINT}
              error={errors.password}
            >
              <input
                name="password"
                type="text"
                autoComplete="new-password"
                {...describedBy('staff-password', { hint: true, error: errors.password })}
              />
            </Field>
            {error ? (
              <p className="cafe-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="cafe-row-actions">
              <button type="submit" className="ui-button ui-button-primary" aria-busy={isBusy}>
                {isBusy ? 'Saving…' : 'Add to the staff'}
              </button>
              <Button onClick={close}>Cancel</Button>
            </div>
          </form>
        </Dialog>
      ) : null}
    </>
  );
}
