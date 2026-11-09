import { expect, test, type Browser } from '@playwright/test';

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

/** Flow 4: a staff member asks to swap a shift; the rota changes only when approved. */

requireTarget();

/** Two staff members and one published shift for the first of them. */
async function setUp(browser: Browser) {
  const manager = await managerContext(browser);
  const page = await manager.newPage();
  const asker = unique('Ivy');
  const colleague = unique('Tom');
  await addStaff(page, asker);
  await addStaff(page, colleague);
  const askerContext = await staffContext(browser, asker.email);
  const colleagueContext = await staffContext(browser, colleague.email);
  const week = freshWeek();
  const day = week.days[3] ?? week.weekStart;
  await addShift(page, { ...week, day, start: '08:00', end: '14:00', who: asker.name });
  await publish(page, week.weekStart);
  return { manager, page, asker, colleague, askerContext, colleagueContext };
}

async function askForSwap(browser: Browser, setup: Awaited<ReturnType<typeof setUp>>) {
  const askerPage = await setup.askerContext.newPage();
  await askerPage.goto('/my-shifts');
  await askerPage.getByRole('button', { name: /^Ask to swap/ }).click();
  const dialog = askerPage.getByRole('dialog');
  await dialog.getByLabel('Who would take it?').selectOption({ label: setup.colleague.name });
  await dialog.getByRole('button', { name: 'Send the request' }).click();
  await expect(dialog).toBeHidden();
  await expect(askerPage.getByText(`Waiting: swap with ${setup.colleague.name}`)).toBeVisible();
  await expect(askerPage.getByText('08:00–14:00'), 'still theirs until approved').toBeVisible();
  return askerPage;
}

test('the manager approves a swap and the shift moves to the colleague', async ({ browser }) => {
  const setup = await setUp(browser);
  const askerPage = await askForSwap(browser, setup);
  await expectFitsPhone(askerPage);

  const colleaguePage = await setup.colleagueContext.newPage();
  await colleaguePage.goto('/my-shifts');
  await expect(colleaguePage.getByText('08:00–14:00'), 'not moved before approval').toHaveCount(0);

  await setup.page.goto('/swaps');
  const row = setup.page.getByRole('row').filter({ hasText: setup.asker.name });
  await expect(row).toContainText(setup.colleague.name);
  await expect(row).toContainText('Waiting');
  await expectFitsPhone(setup.page);
  await row.getByRole('button', { name: /^Approve/ }).click();
  await expect(row).toContainText('Approved');

  await askerPage.reload();
  await expect(askerPage.getByText('08:00–14:00')).toHaveCount(0);
  await colleaguePage.reload();
  await expect(colleaguePage.getByText('08:00–14:00')).toBeVisible();

  await setup.askerContext.close();
  await setup.colleagueContext.close();
  await setup.manager.close();
});

test('the manager turns down a swap and the rota stays as it was', async ({ browser }) => {
  const setup = await setUp(browser);
  const askerPage = await askForSwap(browser, setup);

  await setup.page.goto('/swaps');
  const row = setup.page.getByRole('row').filter({ hasText: setup.asker.name });
  await row.getByRole('button', { name: /^Turn down/ }).click();
  await expect(row).toContainText('Turned down');

  await askerPage.reload();
  await expect(askerPage.getByText('08:00–14:00')).toBeVisible();
  await expect(askerPage.getByText(/turned down/)).toBeVisible();
  const colleaguePage = await setup.colleagueContext.newPage();
  await colleaguePage.goto('/my-shifts');
  await expect(colleaguePage.getByText('08:00–14:00')).toHaveCount(0);

  await setup.askerContext.close();
  await setup.colleagueContext.close();
  await setup.manager.close();
});
