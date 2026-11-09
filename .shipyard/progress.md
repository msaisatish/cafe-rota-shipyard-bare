# Progress

## Decisions

- One café, so no organisation scoping: `organization_tenancy` is not installed and
  "more than one café" is out of scope. Queries are not wrapped in `scoped()`.
- Roles are data, not the `rbac` part: a `Member` row per user with role MANAGER or STAFF.
  The first account ever created becomes the manager; later self-registered accounts with
  no Member row see "not on the staff list".
- Staff accounts are created by the manager with `hashPassword` from auth; `mustChangePassword`
  sends them to /change-password first. Removing someone sets `User.disabledAt` (sessions
  stop at once), marks the Member removed and deletes their upcoming shifts.
- A swap is a hand-over: on approval the shift's person becomes the named colleague.
- Shift times are café wall-clock: a `@db.Date` day plus start/end minutes after midnight.
- Weeks start on Monday.

## Done

- Design blueprint completed in DESIGN.md.
- Schema: Member, Week, Shift, SwapRequest (no migrations folder; Shipyard pushes the schema).
- Plan the week (/rota): add, remove, publish; opens on next week by default.
- Staff (/staff): add with a starting password, remove (sign-in stops, upcoming shifts go).
- First sign-in goes to /change-password; self-registered strangers see /not-on-staff.
- My shifts (/my-shifts): own upcoming published shifts, soonest first, Ask to swap.
- Swap requests (/swaps): approving moves the shift; turning down leaves it.
- Sign-in wording, app name, private link hidden from search engines.
- The café clock is fixed to Europe/London in src/lib/cafe/dates.ts (.env.example is
  blocked from this agent, so no new setting was added).

- Browser checks: e2e/staff, rota, my-shifts, swaps (.spec.ts) with shared steps in
  e2e/cafe.ts. They share one fixed manager account (created by whichever runs first).
- Fixed: dialogs re-ran their setup on every re-render (page stayed unscrollable after
  closing); manager's first visit could race creating the Member row (now an upsert).
- Security: /api/account/password only works while mustChangePassword is set.

## Not checked yet

- The browser checks have never run: .shipyard/check-server.json was missing (test copy
  not running). Shipyard's own run after this turn is their first run.

## Next

- Read the results of Shipyard's browser run and fix what fails.
