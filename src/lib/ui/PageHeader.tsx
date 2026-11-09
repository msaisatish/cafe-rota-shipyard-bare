import type { ReactNode } from 'react';

/** The title of a screen, with its one primary action and any quiet ones beside it. */
export function PageHeader({ title, actions }: { title: ReactNode; actions?: ReactNode }) {
  return (
    <header className="cafe-header">
      <h1>{title}</h1>
      {actions ? <div className="cafe-header-actions">{actions}</div> : null}
    </header>
  );
}
