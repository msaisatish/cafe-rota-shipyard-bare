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

/** Flow 2: the manager plans a week and publishes it; staff see nothing until then. */

requireTarget();

test('the manager adds shifts to a draft week, removes one, and publishes it', async ({
  browser,
}) => {
  const manager = await managerContext(browser);
  const page = await manager.newPage();
  const mia = unique('Mia');
  await addStaff(page, mia);
  const staff = await staffContext(browser, mia.email);
  const week = freshWeek();
  const [monday, tuesday] = week.days;
  if (!monday || !tuesday) throw new Error('A week has seven days.');

  await page.goto(`/rota?week=${week.weekStart}`);
  await expect(page.locator('.ui-status', { hasText: 'Draft' })).toBeVisible();
  await expect(page.getByText('No shifts this week yet.')).toBeVisible();

  await addShift(page, { ...week, day: monday, start: '07:00', end: '15:00', who: mia.name });
  await addShift(page, { ...week, day: tuesday, start: '12:00', end: '18:00', who: mia.name });
  await expect(page.getByRole('row').filter({ hasText: '07:00–15:00' })).toContainText(mia.name);
  await expect(page.getByRole('row').filter({ hasText: '12:00–18:00' })).toContainText(mia.name);
  await expectFitsPhone(page);

  const staffPage = await staff.newPage();
  await staffPage.goto('/my-shifts');
  await expect(staffPage.getByText('No shifts published for you yet.')).toBeVisible();

  await page
    .getByRole('button', { name: new RegExp(`Remove shift: ${mia.name}`) })
    .last()
    .click();
  await expect(page.getByRole('row').filter({ hasText: '12:00–18:00' })).toHaveCount(0);

  await publish(page, week.weekStart);
  await expect(page.getByText('Staff can see this week.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Publish this week' })).toHaveCount(0);

  await staffPage.reload();
  await expect(
    staffPage.getByRole('list', { name: 'Your shifts, soonest first' }).getByRole('listitem'),
  ).toHaveCount(1);
  await expect(
    staffPage
      .getByRole('list', { name: 'Your shifts, soonest first' })
      .getByRole('listitem')
      .first(),
  ).toContainText('07:00–15:00');
  await staff.close();
  await manager.close();
});

test('the plan refuses a shift that ends before it starts or overlaps', async ({ browser }) => {
  const manager = await managerContext(browser);
  const page = await manager.newPage();
  const leo = unique('Leo');
  await addStaff(page, leo);
  const week = freshWeek();
  const monday = week.days[0] ?? week.weekStart;
  await addShift(page, { ...week, day: monday, start: '07:00', end: '12:00', who: leo.name });

  await page.getByRole('button', { name: 'Add a shift' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add a shift' });
  await dialog.getByLabel('Day').selectOption(monday);
  await dialog.getByLabel('Starts').fill('15:00');
  await dialog.getByLabel('Ends').fill('09:00');
  await dialog.getByLabel('Who is working').selectOption({ label: leo.name });
  await dialog.getByRole('button', { name: 'Add shift' }).click();
  await expect(dialog.getByText('Ends must be after starts.')).toBeVisible();

  await dialog.getByLabel('Starts').fill('11:00');
  await dialog.getByLabel('Ends').fill('14:00');
  await dialog.getByRole('button', { name: 'Add shift' }).click();
  await expect(dialog.getByText('They are already working 07:00–12:00 that day.')).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('row').filter({ hasText: leo.name })).toHaveCount(1);
  await manager.close();
});
