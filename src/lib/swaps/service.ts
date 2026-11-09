import { activePeople, namesFor } from '@/lib/access/queries';
import { displayName } from '@/lib/access/rules';
import { cafeToday, formatDay, formatLongDay, formatShiftTime } from '@/lib/cafe/dates';

import {
  allSwapRequests,
  approveSwap,
  createSwapRequest,
  findShift,
  findSwapRequest,
  hasWaitingAsk,
  turnDownSwap,
  upcomingPublishedShifts,
} from './queries';
import { approvalProblem, swapAskProblem } from './rules';

export type SwapResult = { ok: true } | { ok: false; error: string; status: number };

async function isActive(userId: string): Promise<boolean> {
  const people = await activePeople();
  return people.some((person) => person.userId === userId);
}

/** What a staff member sees on My shifts, and who they could hand a shift to. */
export async function loadMyShifts(userId: string) {
  const [shifts, people] = await Promise.all([
    upcomingPublishedShifts(userId, cafeToday()),
    activePeople(),
  ]);
  const names = await namesFor(shifts.flatMap((shift) => shift.swaps.map((s) => s.toUserId)));
  return {
    shifts: shifts.map((shift) => {
      const lastAsk = shift.swaps[0];
      return {
        id: shift.id,
        dayLabel: formatLongDay(shift.day),
        time: formatShiftTime(shift.startMinutes, shift.endMinutes),
        lastAsk: lastAsk
          ? { status: lastAsk.status, colleague: names.get(lastAsk.toUserId) ?? 'a colleague' }
          : null,
      };
    }),
    colleagues: people
      .filter((person) => person.userId !== userId)
      .map((person) => ({ userId: person.userId, name: displayName(person) })),
  };
}

export type MyShift = Awaited<ReturnType<typeof loadMyShifts>>['shifts'][number];

export async function askForSwap(ask: {
  shiftId: string;
  fromUserId: string;
  toUserId: string;
}): Promise<SwapResult> {
  const shift = await findShift(ask.shiftId);
  if (!shift) return { ok: false, error: 'That shift is no longer on the rota.', status: 404 };
  const problem = swapAskProblem({
    shift,
    requesterId: ask.fromUserId,
    colleagueId: ask.toUserId,
    isColleagueActive: await isActive(ask.toUserId),
    hasWaitingAsk: await hasWaitingAsk(ask.shiftId),
    today: cafeToday(),
  });
  if (problem) return { ok: false, error: problem, status: 409 };
  await createSwapRequest(ask);
  return { ok: true };
}

export async function decideSwap(
  swapId: string,
  decision: 'approve' | 'turn-down',
): Promise<SwapResult> {
  const swap = await findSwapRequest(swapId);
  if (!swap) return { ok: false, error: 'That request no longer exists.', status: 404 };
  if (decision === 'turn-down') {
    if (await turnDownSwap(swapId)) return { ok: true };
    return { ok: false, error: 'That request has already been decided.', status: 409 };
  }
  const problem = approvalProblem({
    status: swap.status,
    fromUserId: swap.fromUserId,
    shiftUserId: swap.shift.userId,
    isColleagueActive: await isActive(swap.toUserId),
  });
  if (problem) return { ok: false, error: problem, status: 409 };
  await approveSwap(swap);
  return { ok: true };
}

/** Every request for the manager, the waiting ones first. */
export async function listSwapRequests() {
  const requests = await allSwapRequests();
  const names = await namesFor(requests.flatMap((r) => [r.fromUserId, r.toUserId]));
  const rows = requests.map((request) => ({
    id: request.id,
    shift: `${formatDay(request.shift.day)}, ${formatShiftTime(
      request.shift.startMinutes,
      request.shift.endMinutes,
    )}`,
    from: names.get(request.fromUserId) ?? 'Someone who has left',
    to: names.get(request.toUserId) ?? 'Someone who has left',
    askedOn: formatDay(cafeToday(request.createdAt)),
    status: request.status,
  }));
  return [
    ...rows.filter((r) => r.status === 'WAITING'),
    ...rows.filter((r) => r.status !== 'WAITING'),
  ];
}

export type SwapRow = Awaited<ReturnType<typeof listSwapRequests>>[number];
