import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';

/**
 * Shared steps for the café's browser checks. Each check makes the people and
 * shifts it needs, with names nobody else uses, so no check leans on another.
 *
 * The first account in a fresh database becomes the manager. The checks share
 * one fixed manager account: whichever check runs first creates it, the rest
 * sign in with it.
 */

export const MANAGER = { email: 'manager.checks@example.com', password: 'Espresso-Counter-2026' };
export const STAFF_PASSWORD = 'Kettle-Morning-42x';
export const OWN_PASSWORD = 'Window-Seat-Latte-77';

export function requireTarget() {
  test.beforeEach(({ baseURL }, testInfo) => {
    if (!baseURL) {
      const why = (testInfo.config.metadata as { notRunBecause?: string } | undefined)
        ?.notRunBecause;
      throw new Error(
        why ?? 'The test copy of the app is not running, so it could not be checked.',
      );
    }
  });
}

export function unique(label: string): { name: string; email: string } {
  const tag = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return { name: `${label} ${tag}`, email: `${label.toLowerCase()}.${tag}@example.com` };
}

export async function signIn(page: Page, email: string, password: string) {
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

/** A browser context signed in as the café manager, creating the account if needed. */
export async function managerContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext();
  const login = await context.request.post('/api/auth/login', { data: MANAGER });
  if (!login.ok()) {
    const register = await context.request.post('/api/auth/register', { data: MANAGER });
    expect(register.status(), 'the manager account could be created').toBe(201);
  }
  const page = await context.newPage();
  await page.goto('/');
  await expect(page, 'the shared account is the café manager').toHaveURL(/\/rota/);
  await page.close();
  return context;
}

/** The manager adds a staff member through the Staff screen. */
export async function addStaff(page: Page, person: { name: string; email: string }) {
  await page.goto('/staff');
  await page.getByRole('button', { name: 'Add a staff member' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add a staff member' });
  await dialog.getByLabel('Name').fill(person.name);
  await dialog.getByLabel('Email').fill(person.email);
  await dialog.getByLabel('Starting password').fill(STAFF_PASSWORD);
  await dialog.getByRole('button', { name: 'Add to the staff' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('cell', { name: person.name, exact: true })).toBeVisible();
}

/** A staff member's first sign-in: starting password, then their own. */
export async function staffContext(browser: Browser, email: string): Promise<BrowserContext> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signIn(page, email, STAFF_PASSWORD);
  await expect(page).toHaveURL(/\/change-password/);
  await page.getByLabel('New password').fill(OWN_PASSWORD);
  await page.getByLabel('Type it again').fill(OWN_PASSWORD);
  await page.getByRole('button', { name: 'Save my password' }).click();
  await expect(page).toHaveURL(/\/my-shifts/);
  await page.close();
  return context;
}

/** A Monday far in the future, different for every check, so weeks never collide. */
export function freshWeek(): { weekStart: string; days: string[] } {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const weeks = 20 + Math.floor(Math.random() * 2000);
  const date = new Date(today + weeks * 7 * 86_400_000);
  const sinceMonday = (date.getUTCDay() + 6) % 7;
  const monday = new Date(date.getTime() - sinceMonday * 86_400_000);
  const days = Array.from({ length: 7 }, (_, index) =>
    new Date(monday.getTime() + index * 86_400_000).toISOString().slice(0, 10),
  );
  return { weekStart: days[0] ?? '', days };
}

/** The manager adds one shift on the Plan the week screen. */
export async function addShift(
  page: Page,
  shift: { weekStart: string; day: string; start: string; end: string; who: string },
) {
  await page.goto(`/rota?week=${shift.weekStart}`);
  await page.getByRole('button', { name: 'Add a shift' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add a shift' });
  await dialog.getByLabel('Day').selectOption(shift.day);
  await dialog.getByLabel('Starts').fill(shift.start);
  await dialog.getByLabel('Ends').fill(shift.end);
  await dialog.getByLabel('Who is working').selectOption({ label: shift.who });
  await dialog.getByRole('button', { name: 'Add shift' }).click();
  await expect(dialog).toBeHidden();
}

export async function publish(page: Page, weekStart: string) {
  await page.goto(`/rota?week=${weekStart}`);
  await page.getByRole('button', { name: 'Publish this week' }).click();
  await expect(page.locator('.ui-status', { hasText: 'Published' })).toBeVisible();
}

/** Each screen fits a 390 px phone without scrolling sideways. */
export async function expectFitsPhone(page: Page) {
  const size = page.viewportSize();
  await page.setViewportSize({ width: 390, height: 844 });
  const { content, screen } = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    screen: window.innerWidth,
  }));
  expect(content, 'the page is no wider than a 390 px phone').toBeLessThanOrEqual(screen + 1);
  if (size) await page.setViewportSize(size);
}
