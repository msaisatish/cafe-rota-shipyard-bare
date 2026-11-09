'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

const OFFLINE = 'That did not save. Check your connection and try again.';

interface ActionResult {
  isDone: boolean;
  fieldErrors: Record<string, string>;
}

/**
 * Send one change to the server, then redraw the screen from the database.
 *
 * A failure always comes back as a sentence to show next to the button: a
 * change that did not save must never look like one that did.
 */
export function useAction() {
  const router = useRouter();
  const [isBusy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(url: string, method: string, body?: unknown): Promise<ActionResult> {
    setBusy(true);
    setError(null);
    const response = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).catch(() => null);
    setBusy(false);

    if (!response) {
      setError(OFFLINE);
      return { isDone: false, fieldErrors: {} };
    }
    if (!response.ok) {
      const reply = (await response.json().catch(() => null)) as {
        error?: string;
        fieldErrors?: Record<string, string>;
      } | null;
      setError(reply?.error ?? OFFLINE);
      return { isDone: false, fieldErrors: reply?.fieldErrors ?? {} };
    }
    router.refresh();
    return { isDone: true, fieldErrors: {} };
  }

  // Stable, so a dialog's close handler built on it does not change every render.
  const clearError = useCallback(() => setError(null), []);

  return { isBusy, error, send, clearError };
}
