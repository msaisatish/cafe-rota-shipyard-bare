import type { ReactNode } from 'react';

/** A label above its control, with a hint and the error attached to it. */
export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="cafe-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? (
        <span id={`${id}-hint`} className="cafe-field-hint">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${id}-error`} className="cafe-field-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}

/** The `aria-describedby` and `aria-invalid` a control needs to go with its Field. */
export function describedBy(id: string, options: { hint?: boolean; error?: string }) {
  const ids = [options.hint ? `${id}-hint` : '', options.error ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ');
  return {
    id,
    'aria-describedby': ids || undefined,
    'aria-invalid': options.error ? true : undefined,
  };
}
