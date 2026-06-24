# Vivartam — Founder OS

Internal dashboard for **Vivartam Tech Private Limited** (founders **Vivek Dagur** & **Mirat Soni**).
Single-page app with seven areas: Overview, Timeline, Meetings (mentorship + people), Network (HR-leader CRM),
Future events, Vision board, and Daily affirmations. Light/dark, all state persisted to `localStorage`.

## How to run

## How to run

The app needs to be served over HTTP (so the `styles/` and `data/` modules load — opening the file
with `file://` won't work). From the project folder:

```bash
npm start          # serves on http://localhost:8000  → opens the app
```

`npm start` uses `npx serve`; no install or build step. `index.html` redirects to the app
(`Vivartam Milestones.dc.html`). You can also open that file directly through any static server.

It's a "Design Component": markup + a `Component` logic class wired up by `support.js`.

## File structure

```
index.html                    ← redirect → opens the app (for npm start / localhost root)
Vivartam Milestones.dc.html   ← the app: markup + Component logic class (behaviour & layout)
support.js                    ← runtime (do not edit)

styles/                       ← ALL design/CSS lives here — edit these to change the look
  theme.css                   · colour tokens, fonts, per-section accent vars (light + dark)
  base.css                    · app shell, sidebar, topbar, section headers, Overview widgets, timeline
  habits.css                  · Habits tab (day/week/month/year)
  meetings.css                · Meetings tab (mentorship + people/series tracks)
  network.css                 · Network tab (CRM cards, filters, contact modal)
  future.css                  · Future events tab (our events, discover feed, incubators)
  vision.css                  · Vision board tab (manifestation cards + modal)
  affirmations.css            · Affirmations tab

data/                         ← ALL editable content & sample data lives here
  content.js                  · window.VIVARTAM = { timeline, future, habitsData, visions,
                                  affirmDefaults, discoverEvents, incubators, mentor, mentorSeeds, ... }
  network-data.js             · window.VIVARTAM_NETWORK — 52 HR-leader contacts (from the tracker sheet)

image-slot.js                 ← drag-drop photo placeholder (used by the Vision board)
_ds/                          ← PeopleOS design-system bundle (Card, Button, Badge, Avatar, etc.)
```

## Where to change things

| You want to… | Edit |
|---|---|
| Recolour the brand / theme | `styles/theme.css` (`--primary`, `--surface-brand`, per-tab `--pa` accents) |
| Restyle one screen | the matching `styles/<tab>.css` |
| Change copy, people, dates, affirmations, events | `data/content.js` |
| Edit the contact list | `data/network-data.js` |
| Swap a Vision-board photo | `data/content.js` → the `img:` URL on that vision (or just drag a new image onto the card in the app) |
| Change behaviour, layout structure, or add a screen | the `Component` class in `Vivartam Milestones.dc.html` |

## Inside the .dc.html

The logic is one `class Component extends DCLogic`. It's organised top-to-bottom with `/* ---- section ---- */`
banners that mirror the tabs: data getters (read from `window.VIVARTAM`), helpers, icons, then one render
method per tab (`renderHabits`, `renderNetwork`, `renderFuture`, `renderVision`, `renderAffirmations`,
`renderMeetings`/`renderMentorship`), and the shell (`sidebar`, `topbar`, `body`, `renderApp`).

Styling is class-based via the `styles/` sheets (classes are prefixed `vv-`). Element-level one-offs use
inline `style` objects inside the render methods.

### CSS conventions
- `--pa` / `--pa-strong` = the **active tab's accent** (set per-tab on `.vv-app[data-page="…"]` in `theme.css`).
  Use these for anything that should pick up the current screen's colour.
- Design-system tokens (`--orange`, `--steel`, `--success`, `--danger`, `--surface`, `--text`, …) come from `_ds/`.
- Dark mode = `[data-theme="dark"]` on `<html>`.

## State / persistence keys (localStorage)
`vivarta_layout`, `peopleos_theme`, `vivartam_events`, `vivartam_saved_events`,
`vivartam_tracks`, `vivartam_meeting_notes`, `vivartam_mentor_notes`,
`vivartam_affirmations`, `vivartam_affirm_reviewed`.
