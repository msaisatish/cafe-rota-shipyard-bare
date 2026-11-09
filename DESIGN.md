<!-- shipyard:design -->

# project: design blueprint

*Shipyard writes the part between the `shipyard:design` markers from the approved pages, the theme and the installed parts, and rewrites it when they change. Add your decisions below the closing marker: they are kept.*

## Purpose

Plan a small cafe's weekly shifts, show each person their own shifts, and handle swap requests.

Used by: The café manager, who plans the week, and the staff, who need to know their own shifts and sometimes swap one.

## Flows

1. The manager signs in, adds staff members (name and email, with a starting password the staff member changes when they first sign in), and removes someone who ha
2. The manager plans a week: adds shifts (day, start time, end time, who is working), and publishes the week when it is ready. Staff cannot see a week until it is 
3. A staff member signs in and sees only their own published shifts, soonest first.
4. A staff member asks to swap one of their shifts with a named colleague. The manager approves or turns down the request, and the rota changes only when it is app

## Screens

1. **Sign in** (form) — Manager and staff sign in; a staff member changes their starting password the first time.
   One task, top to bottom: labels above fields, one primary button, errors next to the field. Buttons and messages from `ui_foundation`.
2. **Plan the week** (table) — The manager adds shifts for a week and publishes it.
   A list people scan, sort and filter. Use the data table if it is installed. Built with `data_table`.
3. **Staff** (table) — The manager adds and removes staff members.
   A list people scan, sort and filter. Use the data table if it is installed. Built with `data_table`.
4. **My shifts** (cards) — A staff member's own published shifts, soonest first, with a button to ask for a swap.
   A small number of items people compare at a glance, one card each.
5. **Swap requests** (table) — The manager approves or turns down swap requests.
   A list people scan, sort and filter. Use the data table if it is installed. Built with `data_table`.

## Frame and density

- Frame: a top bar with the app's name and one link per screen above (`ui_blocks` AppShell). No sidebar for this few screens.
- Each screen starts with its title and at most one primary action; other actions are quiet buttons.
- Lists are compact: one line per record, the columns people scan first on the left, actions at the end of the row.
- Forms are one column, labels above fields, the primary button at the end; errors sit next to their field.

## Tokens

Theme: **Calm** — The default. Quiet, high contrast, no personality — it gets out of the way.

Use these values through their CSS variables. Never write a colour, a radius or a spacing step by hand.

| Role | CSS variable | Light value |
| --- | --- | --- |
| bg | `var(--bg)` | `#ffffff` |
| surface | `var(--surface)` | `#f7f8fa` |
| fg | `var(--fg)` | `#14181f` |
| muted | `var(--muted)` | `#5b6472` |
| line | `var(--line)` | `#e3e7ec` |
| accent | `var(--accent)` | `#1f5fd0` |
| accentFg | `var(--accent-fg)` | `#ffffff` |
| focus | `var(--focus)` | `#1f5fd0` |
| ok | `var(--ok)` | `#e6f4ea` |
| okFg | `var(--ok-fg)` | `#1b5e34` |
| warn | `var(--warn)` | `#fdf3e0` |
| warnFg | `var(--warn-fg)` | `#7a4f0c` |
| danger | `var(--danger)` | `#fdecec` |
| dangerFg | `var(--danger-fg)` | `#96201f` |
| radius | `var(--radius)` | from the theme |
| space | `var(--space)` | from the theme |
| fontFamily | `var(--font-family)` | from the theme |
| fontSize | `var(--font-size)` | from the theme |
| lineHeight | `var(--line-height)` | from the theme |

The theme decides light and dark (dark follows the computer's setting, with the same variables). The page is `var(--bg)`; panels, cards and quiet buttons are `var(--surface)`. Those are the pairs the theme's contrast is checked on.

## Components in use

- **How the app looks** (`ui_foundation`): import as `docs/components/ui_foundation.md` shows; do not copy or edit its files. Use it for every button (`ui-button`), status message and focus ring. Adapt it through `src/theme.ts`.
- **The screens every app starts with** (`ui_blocks`): import as `docs/components/ui_blocks.md` shows; do not copy or edit its files. Use it for the frame (AppShell), every confirm or create dialog (Dialog), and number tiles (StatGrid) only on an approved dashboard screen. Adapt it through `src/components/ui_blocks/copy.ts`.
- **The screens people sign in on** (`auth_screens`): import as `docs/components/auth_screens.md` shows; do not copy or edit its files. It ships `/sign-in`, `/register`, `/forgot-password`, `/reset-password`: link to it only if a screen above needs it. Adapt it through `src/components/auth_screens/copy.ts`, `src/components/auth_screens/auth-screens.css`.
- **A list people can sort and search** (`data_table`): import as `docs/components/data_table.md` shows; do not copy or edit its files. Use it for every list of records: sorting, paging and its own empty state; never a hand-written `<table>`. Adapt it through `src/components/data_table/presentation.tsx`, `src/components/data_table/table.css`.

## States every screen has

- **Empty**: what this is for and what to do first; never a blank panel.
- **Loading**: say what is loading; never a frozen screen.
- **Some data**: the ordinary view.
- **Too much data**: a sixty-character name and a hundred rows still read; lists page or scroll.
- **Broken**: a plain sentence and a way to try again; never a stack trace or a dead end.

## Not in this version

- pay and hours totals
- text or email reminders
- clocking in
- more than one café.

No screen, field or action beyond the flows and screens above without asking the founder first.

## Accessibility

- Text contrast at least 4.5:1 and controls at least 3:1, in both light and dark.
- Everything works with the keyboard, and the focus is always visible (`var(--focus)`).
- Every field has a label; every icon-only button has a name.
- Meaning is never carried by colour alone; respect reduced motion.

## Rules for building screens

- Build each screen in the order above, sample data first, then the real data behind it.
- One look across the app: the variables above, the installed parts, nothing else.
- Avoid the generic AI look: gradients, glows, rows of identical cards, big number tiles nobody asked for.
- Before calling a screen done, check it against this file and say which section it meets.

<!-- /shipyard:design -->

## Decisions made while building

The UI designer adds what the generated part cannot know: the details of each screen, wording, and anything decided with the founder.

### The scene

A café manager on a phone or the back-office laptop on Sunday evening, planning next
week in five minutes between closing jobs; staff glancing at their phone on the bus or
behind the counter, wanting one answer: "when am I on next?" Short visits, bright or dim
light, one hand. So: big readable times, the next shift first, nothing to scroll past.

### What this must not look like

- **Not an enterprise rostering suite** (Deputy, a spreadsheet grid of 40 columns). A
  week here is a dozen shifts; it is a list grouped by day, never a dense grid.
- **Not a chat app.** The point is to replace the group chat; no bubbles, no feeds.

### Colour

Restrained. The Calm theme's neutrals, with one accent changed in `src/theme.ts` to a
deep café green (`#1d6b5a` light, `#7fd1bd` dark) instead of the stock blue, so it reads
as this café's tool rather than a template. Accent only on the one primary button per
screen, the current navigation item and links. Status chips (`Status`) carry state with a
word and a mark: **Draft** (warn), **Published** (ok), **Waiting** (warn), **Approved**
(ok), **Turned down** (danger), **Removed** (neutral).

### Type

One family (the theme's system font). Hierarchy by size and weight only: page title
1.75rem/700, day headings 1.125rem/600, shift times 1.25rem/600 with
`font-variant-numeric: tabular-nums` so times line up. Times are written 24-hour
(`07:00–15:00`), days as "Mon 16 Nov".

### Motion

None beyond the theme's 150–200ms hover and focus transitions. Dialogs appear without
sliding. Everything respects `prefers-reduced-motion` through `ui_foundation`.

### Screens

Frame: `AppShell` with the nav on the left on a laptop and on top on a phone. Above the
content, a thin bar: "Café rota", the person's name, and a quiet **Sign out** button.
Manager nav: Plan the week · Staff · Swap requests. Staff nav: My shifts.

1. **Sign in** — the installed `/sign-in` screen as it is. The register link reads
   "Setting up the café for the first time? Create the manager account". The first account
   ever created becomes the manager. Anyone else who signs up without being added sees
   "You are not on the staff list yet. Ask your manager to add you." Staff signing in with
   their starting password land on **Choose your own password** (new password, type it
   again, "Save my password") before anything else.
2. **Plan the week** (`/rota`) — title "Week of Mon 16 Nov", a status chip (Draft or
   Published), links "← Previous week" and "Next week →". Primary: **Publish this week**
   (only while Draft; afterwards a line "Staff can see this week. Changes show straight
   away."). Quiet: **Add a shift** opens a form dialog: Day (Mon–Sun of this week), Starts,
   Ends, Who is working. Data table: Day, Time, Who, and a quiet **Remove** per row.
   Empty: "No shifts this week yet. Add the first one." Errors: "Ends must be after starts."
3. **Staff** (`/staff`) — title "Staff", quiet **Add a staff member** dialog: Name, Email,
   Starting password (with the 12-character hint). Table: Name, Email, Role, Password
   ("Starting password" warn / "Own password" ok), and **Remove** with a confirm dialog:
   "Remove Sam? They can no longer sign in, and their upcoming shifts come off the rota."
4. **My shifts** (`/my-shifts`) — title "My shifts". One card per upcoming published
   shift, soonest first: day and date, the time large, and **Ask to swap** (quiet). A
   pending ask shows "Waiting: swap with Alex" instead of the button; a turned-down one
   shows the chip and the button again. The dialog: "Who would take it?" (a colleague
   list), "Send the request". Empty: "No shifts published for you yet. When your manager
   publishes a week, your shifts appear here."
5. **Swap requests** (`/swaps`) — title "Swap requests". Table: Shift, From, To, Asked,
   Status, and **Approve** / **Turn down** on waiting rows. Approving moves the shift to
   the colleague at once. Empty: "No swap requests. When someone asks to swap a shift, it
   appears here for you to approve."

Broken state everywhere: "That did not save. Check your connection and try again." next
to the button, never a silent failure. Loading: the button says what it is doing
("Publishing…", "Saving…").
