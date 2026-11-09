import { describe, expect, it } from 'vitest';

import { homeFor, redirectFor } from '@/lib/access/rules';

const manager = { role: 'MANAGER' as const, mustChangePassword: false };
const staff = { role: 'STAFF' as const, mustChangePassword: false };

describe('who may open which screen', () => {
  it('sends each role to its own home', () => {
    expect(homeFor('MANAGER')).toBe('/rota');
    expect(homeFor('STAFF')).toBe('/my-shifts');
  });

  it('keeps staff out of the manager screens', () => {
    expect(redirectFor(staff, 'MANAGER')).toBe('/my-shifts');
    expect(redirectFor(staff, 'STAFF')).toBeNull();
  });

  it('keeps the manager out of the staff-only screen', () => {
    expect(redirectFor(manager, 'STAFF')).toBe('/rota');
    expect(redirectFor(manager, 'MANAGER')).toBeNull();
  });

  it('turns away accounts that are not on the staff list', () => {
    expect(redirectFor(null, 'STAFF')).toBe('/not-on-staff');
    expect(redirectFor(null)).toBe('/not-on-staff');
  });

  it('makes a starting password be changed before anything else', () => {
    const newStarter = { ...staff, mustChangePassword: true };
    expect(redirectFor(newStarter, 'STAFF')).toBe('/change-password');
    expect(redirectFor(newStarter)).toBe('/change-password');
  });
});
