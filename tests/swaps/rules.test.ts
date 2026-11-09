import { describe, expect, it } from 'vitest';

import { approvalProblem, swapAskProblem, type AskForSwap } from '@/lib/swaps/rules';

const ask: AskForSwap = {
  shift: { userId: 'sam', day: '2026-11-18', isPublished: true },
  requesterId: 'sam',
  colleagueId: 'alex',
  isColleagueActive: true,
  hasWaitingAsk: false,
  today: '2026-11-16',
};

describe('asking for a swap', () => {
  it('lets someone ask to hand their own upcoming shift to a colleague', () => {
    expect(swapAskProblem(ask)).toBeNull();
  });

  it('refuses someone else’s shift', () => {
    expect(swapAskProblem({ ...ask, requesterId: 'alex', colleagueId: 'jo' })).toBe(
      'That shift is not one of yours.',
    );
  });

  it('refuses a shift in a week that is not published', () => {
    const draft = { ...ask, shift: { ...ask.shift, isPublished: false } };
    expect(swapAskProblem(draft)).toBe('That shift is not one of yours.');
  });

  it('refuses a shift that has already happened', () => {
    expect(swapAskProblem({ ...ask, today: '2026-11-19' })).toBe(
      'That shift has already happened.',
    );
  });

  it('refuses swapping with yourself or someone who has left', () => {
    expect(swapAskProblem({ ...ask, colleagueId: 'sam' })).toBe(
      'Choose a colleague, not yourself.',
    );
    expect(swapAskProblem({ ...ask, isColleagueActive: false })).toBe(
      'Choose someone who still works here.',
    );
  });

  it('allows one waiting request per shift', () => {
    expect(swapAskProblem({ ...ask, hasWaitingAsk: true })).toBe(
      'You have already asked to swap this shift.',
    );
  });
});

describe('approving a swap', () => {
  const swap = {
    status: 'WAITING' as const,
    fromUserId: 'sam',
    shiftUserId: 'sam',
    isColleagueActive: true,
  };

  it('approves a waiting request', () => {
    expect(approvalProblem(swap)).toBeNull();
  });

  it('does not decide a request twice', () => {
    expect(approvalProblem({ ...swap, status: 'APPROVED' })).toBe(
      'That request has already been decided.',
    );
    expect(approvalProblem({ ...swap, status: 'TURNED_DOWN' })).toBe(
      'That request has already been decided.',
    );
  });

  it('refuses when the shift has moved to someone else since', () => {
    expect(approvalProblem({ ...swap, shiftUserId: 'jo' })).toBe(
      'That shift has changed hands since the request was made.',
    );
  });

  it('refuses when the colleague has left', () => {
    expect(approvalProblem({ ...swap, isColleagueActive: false })).toBe(
      'The colleague no longer works here.',
    );
  });
});
