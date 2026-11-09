import { expect, test } from '@playwright/test';

import {
  addStaff,
  expectFitsPhone,
  managerContext,
  MANAGER,
  OWN_PASSWORD,
  requireTarget,
  signIn,
  STAFF_PASSWORD,
  unique,
} from './cafe';

/** Flow 1: the manager signs in, adds staff members, and removes someone who has left. */

requireTarget();

test('the manager signs in on the sign-in screen and lands on the plan', async ({
  browser,
  page,
}) => {
  await (await managerContext(browser)).close();
  await signIn(page, MANAGER.email, MANAGER.password);
  await expect(page).toHaveURL(/\/rota/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Week of');
  await expect(page.getByRole('link', { name: 'Staff' })).toBeVisible();
  await expectFitsPhone(page);
});

test('the manager adds a staff member who then chooses their own password', async ({ browser }) => {
  const manager = await managerContext(browser);
  const page = await manager.newPage();
  const sam = unique('Sam');
  await addStaff(page, sam);
  await expect(page.getByText('Starting password').first()).toBeVisible();
  await expectFitsPhone(page);

  const staff = await browser.newContext();
  const staffPage = await staff.newPage();
  await signIn(staffPage, sam.email, STAFF_PASSWORD);
  await expect(staffPage).toHaveURL(/\/change-password/);
  await expect(staffPage.getByRole('heading', { name: 'Choose your own password' })).toBeVisible();
  await staffPage.goto('/my-shifts');
  await expect(staffPage, 'shifts wait until the password is changed').toHaveURL(
    /\/change-password/,
  );
  await staffPage.getByLabel('New password').fill(OWN_PASSWORD);
  await staffPage.getByLabel('Type it again').fill(OWN_PASSWORD);
  await staffPage.getByRole('button', { name: 'Save my password' }).click();
  await expect(staffPage).toHaveURL(/\/my-shifts/);

  await page.reload();
  const row = page.getByRole('row').filter({ hasText: sam.name });
  await expect(row.getByText('Own password')).toBeVisible();
  await staff.close();
  await manager.close();
});

test('the manager removes someone who has left, and they can no longer sign in', async ({
  browser,
}) => {
  const manager = await managerContext(browser);
  const page = await manager.newPage();
  const jo = unique('Jo');
  await addStaff(page, jo);

  await page.getByRole('button', { name: `Remove ${jo.name}` }).click();
  const dialog = page.getByRole('dialog', { name: `Remove ${jo.name}?` });
  await expect(dialog).toContainText('their upcoming shifts come off the rota');
  await dialog.getByRole('button', { name: `Remove ${jo.name}` }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('cell', { name: jo.name, exact: true })).toHaveCount(0);

  const gone = await browser.newContext();
  const gonePage = await gone.newPage();
  await signIn(gonePage, jo.email, STAFF_PASSWORD);
  await expect(
    gonePage.getByText('That email address and password do not go together.'),
  ).toBeVisible();
  await expect(gonePage).toHaveURL(/\/sign-in/);
  await gone.close();
  await manager.close();
});

test('staff cannot open the manager screens', async ({ browser }) => {
  const manager = await managerContext(browser);
  const page = await manager.newPage();
  const alex = unique('Alex');
  await addStaff(page, alex);

  const staff = await browser.newContext();
  const staffPage = await staff.newPage();
  await signIn(staffPage, alex.email, STAFF_PASSWORD);
  await staffPage.getByLabel('New password').fill(OWN_PASSWORD);
  await staffPage.getByLabel('Type it again').fill(OWN_PASSWORD);
  await staffPage.getByRole('button', { name: 'Save my password' }).click();
  await expect(staffPage).toHaveURL(/\/my-shifts/);

  for (const screen of ['/rota', '/staff', '/swaps']) {
    await staffPage.goto(screen);
    await expect(staffPage, `${screen} sends staff back to their shifts`).toHaveURL(/\/my-shifts/);
  }
  const attempt = await staff.request.post('/api/staff', {
    data: { name: 'Sneaky', email: 'sneaky@example.com', password: STAFF_PASSWORD },
  });
  expect(attempt.status(), 'staff cannot add people').toBe(403);
  await staff.close();
  await manager.close();
});
