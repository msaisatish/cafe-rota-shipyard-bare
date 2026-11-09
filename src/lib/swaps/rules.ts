/**
 * When a swap may be asked for and when it may be approved. Pure, so tested
 * without a database.
 *
 * A swap hands the shift to the named colleague. The rota changes only when
 * the manager approves, so the manager always knows who is really working.
 */

export interface AskForSwap {
  shift: { userId: string; day: string; isPublished: boolean };
  requesterId: string;
  colleagueId: string;
  isColleagueActive: boolean;
  hasWaitingAsk: boolean;
  today: string;
}

export function swapAskProblem(ask: AskForSwap): string | null {
  if (ask.shift.userId !== ask.requesterId || !ask.shift.isPublished) {
    return 'That shift is not one of yours.';
  }
  if (ask.shift.day < ask.today) return 'That shift has already happened.';
  if (ask.colleagueId === ask.requesterId) return 'Choose a colleague, not yourself.';
  if (!ask.isColleagueActive) return 'Choose someone who still works here.';
  if (ask.hasWaitingAsk) return 'You have already asked to swap this shift.';
  return null;
}

export interface SwapToDecide {
  status: 'WAITING' | 'APPROVED' | 'TURNED_DOWN';
  fromUserId: string;
  shiftUserId: string;
  isColleagueActive: boolean;
}

/** Why a swap cannot be approved, or null. Turning one down is always allowed while it waits. */
export function approvalProblem(swap: SwapToDecide): string | null {
  if (swap.status !== 'WAITING') return 'That request has already been decided.';
  if (swap.shiftUserId !== swap.fromUserId) {
    return 'That shift has changed hands since the request was made.';
  }
  if (!swap.isColleagueActive) return 'The colleague no longer works here.';
  return null;
}

export const SWAP_STATUS_LABEL = {
  WAITING: 'Waiting',
  APPROVED: 'Approved',
  TURNED_DOWN: 'Turned down',
} as const;
