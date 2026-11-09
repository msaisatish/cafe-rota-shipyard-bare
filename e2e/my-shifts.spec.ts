import { expect, test } from '@playwright/test';

import {
  addShift,
  addStaff,
  expectFitsPhone,
  freshWeek,
  managerContext,
  publish,
  requireTarget,
  staffContext,
  unique,
} from './cafe';

/** Flow 3: a staff member sees only their own published shifts, soonest first. */

requireTarget();

test('a staff member sees only their own shifts, soonest first', async ({ browser }) => {
  const manager = await managerContext(browser);
  const page = await manager.newPage();
  const ana = unique('Ana');
  const ben = unique('Ben');
  await addStaff(page, ana);
  await addStaff(page, ben);
  const anaContext = await staffContext(browser, ana.email);

  const week = freshWeek();
  const [monday, , wednesday, , friday] = week.days;
  if (!monday || !wednesday || !friday) throw new Error('A week has seven days.');
  // Added out of order on purpose: the list must sort them, not keep the order typed.
  await addShift(page, { ...week, day: friday, start: '09:00', end: '13:00', who: ana.name });
  await addShift(page, { ...week, day: monday, start: '07:30', end: '11:30', who: ana.name });
  await addShift(page, { ...week, day: wednesday, start: '10:00', end: '16:00', who: ben.name });
  await publish(page, week.weekStart);

  const anaPage = await anaContext.newPage();
  await anaPage.goto('/my-shifts');
  await expect(anaPage.getByRole('heading', { level: 1, name: 'My shifts' })).toBeVisible();
  const cards = anaPage
    .getByRole('list', { name: 'Your shifts, soonest first' })
    .getByRole('listitem');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText('07:30–11:30');
  await expect(cards.nth(0)).toContainText('Next:');
  await expect(cards.nth(1)).toContainText('09:00–13:00');
  await expect(anaPage.getByText('10:00–16:00'), 'Ben’s shift is not shown to Ana').toHaveCount(0);
  await expect(anaPage.getByRole('link', { name: 'Plan the week' })).toHaveCount(0);
  await expectFitsPhone(anaPage);

  await anaContext.close();
  await manager.close();
});
