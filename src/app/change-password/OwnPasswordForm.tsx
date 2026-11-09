'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { ownPasswordSchema } from '@/lib/staff/schema';
import { Field, describedBy } from '@/lib/ui/Field';
import { useAction } from '@/lib/ui/useAction';
import { validate } from '@/seams/validate';

const HINT = 'At least 12 characters. A short sentence you will remember works well.';

export function OwnPasswordForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { isBusy, error, send } = useAction();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;
    const input = validate(
      ownPasswordSchema,
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!input.ok) {
      setErrors(input.fieldErrors);
      return;
    }
    setErrors({});
    const result = await send('/api/account/password', 'POST', input.data);
    if (result.isDone) router.push('/');
    else setErrors(result.fieldErrors);
  }

  return (
    <form className="cafe-form" onSubmit={submit} noValidate>
      <Field id="own-password" label="New password" hint={HINT} error={errors.password}>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          {...describedBy('own-password', { hint: true, error: errors.password })}
        />
      </Field>
      <Field id="own-confirm" label="Type it again" error={errors.confirm}>
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          {...describedBy('own-confirm', { error: errors.confirm })}
        />
      </Field>
      {error ? (
        <p className="cafe-error" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <button type="submit" className="ui-button ui-button-primary" aria-busy={isBusy}>
          {isBusy ? 'Saving…' : 'Save my password'}
        </button>
      </div>
    </form>
  );
}
