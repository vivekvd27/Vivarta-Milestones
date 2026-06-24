# PeopleOS Design System

The brand and product design system for **PeopleOS** — an AI-powered HR platform positioned as a *"company brain"* for people leaders, especially CHROs. The whole system is built around one idea: **intelligence with authority, and a pulse of energy** — it brings AI agents and automation into hiring and people operations while keeping *trust and human judgment* at the center. The visual signature is the **Pulse** identity: navy authority, an orange energy core, and a speedometer mark.

PeopleOS is currently pre-launch / early-access (waitlist + CHRO outreach + build-in-public founder content), so this system codifies the brand and a believable product surface rather than a locked, shipped feature set.

> **Brand: "PeopleOS Pulse" (v2.0).** The system is now rebased on the Pulse identity — **Navy authority (#143A66) + Orange energy (#F2A024) + cool Slate neutrals**, on a deep **Navy-900 (#0A1C33)** dark surface. The mark is the **speedometer/pulse**: a near-360° C-ring (navy on light / white on dark), two gray inner arcs, and an orange core dot. Wordmark = navy/white "People" + orange "OS". Light bg is a cool off-white (#F1F4F8). Dark theme adds the signature blueprint-grid + faded-mark ambiance (`.pos-darkcanvas`). The whole palette lives in `tokens/colors.css`; legacy token *names* (`--people-green`, `--amber`, …) are kept but now hold Pulse *values*, so every component inherited the rebrand. Real brand assets are in `assets/brand/pulse/` (app icons, LinkedIn avatar/covers, animated logos).

> **Status caveat.** The screens here (app + storyboard + marketing) are a *plausible product* inferred from the brand positioning and the three real reference screens provided. They are recreations/proposals, not a spec. Treat the **brand foundations** (color, type, logo, tone) as locked, and the **product screens** as directional until confirmed.

---

## Sources

What this system was built from (no assumption the reader has access — recorded for provenance):

- **`uploads/PeopleOS-Locked-Palette.md`** — the locked v1.0 brand palette ("Green-dot Chartreuse"), the single source of truth for color and the logo's color rules.
- **`uploads/peopleos-final-logo-animated-dark.svg`** — the official animated logo (dark variant). The static + mark-only lockups in `assets/logo/` are derived from this.
- **Reference product screens** (in `assets/screens/`):
  - `app-dashboard-macbook.png` — desktop CHRO dashboard
  - `app-dashboard-iphone.png` — mobile "Good morning" home
  - `app-candidates-iphone.png` — mobile candidate list
- **`uploads/PeopleOS-Palette-Card.png`** — the palette rendered as a visual card.
- **`uploads/PeopleOS_Complete_Strategy.docx`** — the full company/product strategy (the four modules: Acquire · Engage · Grow · Foresight; 8 AI agents; ICPs; pricing; roadmap). Drives `ui_kits/app/modules.html`.
- **`uploads/peopleos-carousel-post.skill`** — the brand kit / Agent Skill bundle (extracted to `skills/peopleos-carousel-post/`). Source of the **real brand fonts**, the raster mark, the social/carousel design system, and the founder voice + content philosophy.

No codebase or Figma file was provided. If you have either, drop it in and the product UI kits can be tightened to match real components.

---

## Content fundamentals — how PeopleOS writes

The voice is **calm, warm, and quietly confident** — a trusted advisor, never a hype machine. It speaks *to* a senior, busy human (the CHRO) and respects their judgment.

- **Person & address.** Speak to the user as **"you"**; the product/company is **"we."** The AI is referred to in the third person as **agents** ("your agents screened 240 profiles overnight") — never "the AI" or "the robot," and never first-person ("I found…").
- **Tone.** Reassuring and grounded. Lead with the human outcome ("12 candidates shortlisted today," "37h saved"), not the technology. Automation is framed as *giving time back*, not replacing people.
- **Casing.** Sentence case everywhere — headings, buttons, nav. **No Title Case, no ALL CAPS** except tiny overline/eyebrow labels (tracked-out, uppercase, e.g. `AI SUMMARY`).
- **Length.** Short. Greeting + one supporting line is the house pattern: *"Good morning, Aarav" / "Your agents screened 240 profiles overnight."* Buttons are verb-first and specific: **"Schedule top 3 interviews," "Join the waitlist," "New role."**
- **Numbers.** Numerals, not words ("18 new matches," "240 resumes"). Indian-context figures are welcome (`₹4.2L`, Bengaluru/Pune/Hyderabad locations) — the reference product is India-market.
- **Emoji.** **None.** The brand expresses energy through color and the pulse mark — not emoji. Don't introduce them.
- **Vibe words:** composed, authority, energy, augment, brief, company brain, people leaders, clarity, momentum. **Avoid:** disrupt, supercharge, 10x, revolutionary, "powered by AI" badges, exclamation marks.

Examples (house style):
- Hero: *"The company brain for people leaders."*
- Empty state: *"No roles open yet. Create your first one and your agents start sourcing."*
- Agent line: *"Sourcing agent · Found 18 new matches for Backend Lead · 2m"*

---

## Visual foundations

A composed, navy-and-orange world: **authority with a pulse of energy.** Cool, confident surfaces with a single warm orange used decisively for the live, human moments.

- **Color.** Cool off-white (`--paper` #F1F4F8) backgrounds; **white** cards; **Pulse Navy** (`--navy` #143A66) as the primary/brand color; **Pulse Orange** (`--orange` #F2A024) as the energy accent, with **Deep Orange** (`--orange-deep` #D9850C) for links. Supporting data hues are **Steel** (`--steel` #4E86C4) and **Yellow** (`--yellow` #F4C152); the **fit-score scale** runs deep-steel → steel → orange → deep-orange (high→low). Dark mode flips to **Navy-900** (`--night` #0A1C33) surfaces where **Orange becomes the primary CTA** and the mark's ring goes **white**; *the orange core never changes color.* Color is always flat — **no gradients on brand color, no glows or blends** (the dark blueprint-grid ambiance is the one sanctioned exception). Canonical token names are `--navy / --orange / --steel / --yellow` plus the `*-tint` scales; the old `--people-green / --amber …` names still resolve as deprecated aliases.
- **Typography.** Display + UI = **Bricolage Grotesque** (warm, human-but-intelligent grotesque) for headings, the wordmark feel, big stat numerals, body and labels; reflective accent = **Instrument Serif** *Italic* (one literary, human beat at a time); system labels / kickers / footers / code = **IBM Plex Mono** (the technical "OS" voice). Sentence case, tight tracking on display sizes, tabular numerals for stats. All three are **real brand faces, self-hosted** via `@font-face` (see "Fonts").
- **Spacing.** 4px base scale, generous. Calm density — content breathes; cards have real internal padding (16–24px). Layout is centered/contained (max ~1200–1320px) with a 232px brand sidebar in the app.
- **Backgrounds.** Flat cool-paper (light) or flat Navy-900 (dark). No photographic hero backgrounds. The signature motif is the **speedometer mark** — in dark theme, a faint **blueprint grid + a soft warm glow with the mark fading out of the bottom-left corner** (`.pos-darkcanvas`); in light theme surfaces stay clean and flat.
- **Animation.** Composed, **no bounce.** Easing is `cubic-bezier(0.22,1,0.36,1)` (ease-out) / `(0.4,0,0.2,1)` (soft). Durations 120–360ms for UI; the signature motion is the **mark draw-on** (the ring sweeps, the orange core pops, ~900ms). Score rings sweep up. Respect `prefers-reduced-motion` — entrance/fill animations must degrade to the visible end-state.
- **Hover states.** Buttons darken to a deeper shade of the same hue (`--primary-hover`); ghost/soft buttons gain a navy-tint (light) / orange-tint (dark) fill; cards lift (`shadow-sm → shadow-lg`) and rise 2px. Never lighten-on-hover, never change hue.
- **Press states.** A gentle scale-down (`scale(0.99)` buttons, `0.93` icon buttons) plus the deeper press color — tactile but quiet.
- **Borders.** Hairline `--border` (#E3E8EF) on cards (1px), `--border-strong` (#D2D9E3) on inputs/secondary buttons (1.5px). On navy panels, borders are translucent white hairlines.
- **Shadows.** Soft, cool-tinted, **low opacity** — diffuse and large-radius, never hard. `shadow-sm` for resting cards, `shadow-md/lg` for raised/hover, `shadow-brand` (navy-cast) for brand panels. No inner shadows in the product; the only inset is an optional hairline ring to crisp white cards.
- **Transparency & blur.** Used sparingly: translucent white overlays on the navy sidebar for active/hover nav; bottom "protection" gradients (paper→transparent) behind sticky CTAs on mobile. No glassmorphism / heavy backdrop-blur.
- **Imagery vibe.** When people photography is used (marketing), it should read **confident, candid, natural-light** — not cold corporate stock, not heavy filters. Avatars in-product are auto-colored initials from a cool multi-hue palette.
- **Corner radii.** Soft and consistent: inputs/chips 12px, cards 16px, panels 20–28px, **buttons and tabs fully pill** (999px), avatars circular. Nothing sharp-cornered.
- **Cards.** White surface, 16px radius, 1px hairline border, soft `shadow-sm`. Interactive cards lift on hover. The **brand card** variant is a dark People-Green panel (20px radius, white text, green-cast shadow) used for the hero/highlight tile.

---

## Iconography

- **System.** A single **line-icon set** — 24×24, **2px stroke, round caps and joins**, no fills. This matches the geometric-but-soft logo. The closest CDN/standard match is **Lucide / Feather** style; the app UI kit ships an inline Lucide-style set in `ui_kits/app/icons.jsx`. If you need more icons, use **[Lucide](https://lucide.dev)** (stroke 2, round) to stay consistent. *(Substitution flagged: no proprietary icon font was provided.)*
- **Color.** Icons inherit text color — muted by default, Navy when active (light) / Orange when active (dark), white on the navy sidebar. Never multi-color icons; never duotone.
- **The mark is not an icon.** The speedometer mark is brand furniture (logo, app tile, dark-canvas bleed) — don't use it inline as a UI glyph.
- **Emoji / unicode as icons.** **Never.** Status is shown with colored dots + line icons, not emoji.
- **Avatars.** Circular initials on an auto-assigned warm hue (the `--avatar-*` palette), or a photo when available.

---

## Fonts — real brand faces, self-hosted ✓

The actual PeopleOS brand fonts ship in `assets/fonts/` and are loaded via `@font-face` in `tokens/fonts.css` (no CDN, works offline). They came with the brand kit / carousel skill:

| Role | Font | Token | Files |
|---|---|---|---|
| Display + UI | **Bricolage Grotesque** | `--font-display`, `--font-sans` | Regular, Bold |
| Reflective accent (italic) | **Instrument Serif** | `--font-serif`, `--accent-serif` | Italic |
| System / mono | **IBM Plex Mono** | `--font-mono` | Regular, Bold |

Only Regular + Bold static files exist, so each `@font-face` maps a **weight range** onto the available file (600+ → Bold). If you have the full weight set (or the Bricolage variable font), drop them in and widen the ranges.

---

## How it's wired (for consumers)

- **One stylesheet:** link **`styles.css`** — it `@import`s every token + font file. That gives you all CSS custom properties (`--navy`, `--orange`, `--text`, `--surface`, `--radius-pill`, `--shadow-md`, …) and the webfonts.
- **Dark mode:** set `data-theme="dark"` (or class `.theme-dark`) on a container/root.
- **Components:** React, loaded from the compiled bundle `_ds_bundle.js` and read off the global namespace (run `check_design_system` for the exact name, currently `window.PeopleOSDesignSystem_eb8f2f`). Each `<Name>.prompt.md` has usage + variants.

---

## Index / manifest

**Root**
- `styles.css` — global entry (imports only)
- `readme.md` — this guide
- `HANDOFF.md` — developer handoff spec (tokens, components + states, breakpoints, theming, a11y)
- `SKILL.md` — Agent-Skills-compatible entry point
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css`, `effects.css`, `a11y.css`, `responsive.css`

**Assets** (`assets/`)
- `logo/` — `peopleos-logo-light.svg`, `peopleos-logo-dark.svg`, `peopleos-mark-light.svg`, `peopleos-mark-dark.svg`, `peopleos-logo-animated-dark.svg`
- `fonts/` — the real brand faces (Bricolage Grotesque, IBM Plex Mono, Instrument Serif)
- `brand/` — `palette-card.png`, `peopleos-mark.png` (full-color raster mark)
- `screens/` — reference screenshots (desktop dashboard, mobile home, mobile candidates)

**Components** (`components/`, React)
- `buttons/` — **Button**, **IconButton**
- `forms/` — **Input**, **Switch**, **FilterTabs**
- `data-display/` — **Avatar**, **Badge**, **Tag**, **ScoreRing**
- `layout/` — **Card**, **StatCard**
- `brand/` — **Logo**
- `app/` — **AgentRow**, **CandidateRow**, **PipelineBar**, **NavItem**

**Foundation cards** (`guidelines/`) — Colors, Type, Spacing, Brand specimen cards shown in the Design System tab.

**UI kits** (`ui_kits/`)
- `app/` — the PeopleOS product. `splash.html` is the **first page** — an animated PeopleOS logo that auto-advances to the launcher. `modules.html` is the four-module launcher → login (light + dark). `acquire-dashboard.html` is the **Acquire recruiter/CHRO dashboard** — the full post-login product layout (sidebar, KPIs, pipeline, agent feed, dropout risk, predicted quality) in **light + dark** with a toggle. `storyboard.html` maps the full end-to-end recruitment lifecycle across Desktop / Tablet / Phone (light only — it's an overview map); its Desktop lane opens with the Splash + Module-launcher entry mockups. Screen renderers + interactive screens (HomeScreen, CandidatesScreen, AcquireDashboard) in JSX.

> **Theming convention.** *Product layout pages* (modules, acquire-dashboard, and future screens) ship **light + dark** with a toggle, persisted to `localStorage['peopleos_theme']` and shared across pages, with a no-flash inline `<head>` script. *Overview/map pages* (the storyboard) are single-theme (light).

**Skills** (`skills/`)
- `peopleos-carousel-post/` — a downloadable **Agent Skill** for producing on-brand LinkedIn/social carousels in the locked dark look + founder voice. Ships its own `SKILL.md`, brand/voice/design references, the `build_carousel.py` renderer, the raster mark, and the brand fonts. See its `references/design-system.md` for the **social palette** (dark `#17181D`, orange `#F09C00`, yellow `#F0C048`, green `#6CA83C`, teal `#186060`) and the locked carousel composition — a distinct dark, editorial context that complements the product's light Paper system.

---

## Open questions for the brand owner

1. **Does PeopleOS have a native mobile app, or is it web-only?** (Determines whether the Phone/Tablet lanes stay or become responsive web views.)
2. **CHRO-centric (dashboards/insights) vs. recruiter-centric (pipeline/candidates)** — which leads the product?
3. ~~Font files~~ — ✅ resolved: real brand fonts (Bricolage Grotesque, Instrument Serif, IBM Plex Mono) are now self-hosted.
4. Which storyboard screens are real vs. wrong vs. missing?
