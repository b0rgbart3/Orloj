# Astrological Clock

A digital recreation of the Prague Orloj — the medieval astronomical clock on Prague's Old Town Hall — built as layered, animated SVG graphics in React.

## About the Prague Orloj

The Prague Orloj (built starting 1410, the oldest astronomical clock still running) is really three independent machines stacked on one wall. Understanding them separately is the key to modelling it — they don't share a clockwork logic, they just share a facade.

### The Astronomical Dial (the upper face)

This is the heart of it and where most people get lost. It is not a clock face with extra decoration — it's a mechanical astrolabe, a flat stereographic projection of the sky as seen from Prague's latitude. The clever part is that a single moving Sun hand lets you read four different time systems at once, because each system is just a different ring it crosses:

- **Civil time (Roman numerals)** — the fixed black ring with I–XII twice around. Ordinary 24-hour time; you read where the golden Sun hand points. This is the only system most modern viewers recognise.
- **Old Bohemian / Italian time (the gold Gothic ring)** — the outermost ring of ornate Schwabacher numerals running 1–24, where hour 24 always lands at sunset. Because sunset drifts through the year, this entire ring is geared to rotate slowly, so the "24" position tracks the seasons.
- **Babylonian / unequal hours (the curved gold arcs)** — these split the daylight portion into 12 equal parts. Since daylight is longer in summer, a "Babylonian hour" is physically longer in July than in December. These arcs only exist inside the blue day-disk.
- **Sidereal / star time and the zodiac** — the off-centre zodiac ring rotates roughly once per sidereal day and shows which constellation the Sun is sitting in. Its eccentric (off-centre) placement is a direct consequence of the stereographic projection — that off-centredness is what makes the geometry look intimidating.

Layered on top of those rings are the moving indicators: the Sun hand (whose tip rides along the zodiac ring), the Moon hand with a half-silvered rotating sphere that physically turns to display the current lunar phase, and the static background plate showing the blue day sky, the orange dawn/dusk twilight bands (ORTVS/OCCASVS), and the black night zone (NOX) below the horizon.

The useful insight for this build is that this whole face is mathematically generated, not artistic: given a latitude (~50°N), the tropics, equator, horizon and twilight curves all fall out of standard astrolabe projection formulas. The ring positions can be computed from the date/time rather than hand-placed.

## The moving arms: construction and rotation

Three indicators rotate around the shared pivot `(600,600)`: the **Sun arm**, the **Moon arm**, and the **Star (sidereal) arm**. Each is its own SVG file/layer (`sun_dial.svg`, `moon_dial.svg`, `star_dial.svg`) rather than one shared drawing, because each turns at a genuinely different, independent rate:

| Arm | Period | Drives |
|---|---|---|
| Sun | ~24h00m (solar day) | Civil time (Roman ring), Old Bohemian time (numeric ring) |
| Moon | ~24h50m (lunar day) | Moon's position; angular gap vs. Sun gives lunar phase |
| Star / zodiac ring | ~23h56m (sidereal day) | Sidereal time; also the zodiac ring's own slow rotation |

Our rotation mechanism applies exactly one CSS `rotate()` value to an entire layer, so anything that needs to point at a genuinely different angle at a given moment *has* to live in its own layer — there's no way to spin part of one SVG independently of the rest of it. That's also why the Sun's little pointing hand (the *zlatá ručička* / manicule, reaching out to the outer numeral rings) is just extra artwork baked into `sun_dial.svg` rather than a fourth rotating layer: it's rigidly bolted to the Sun arm at a fixed radius and always shares the Sun's exact angle, so it comes along for free whenever the Sun arm rotates.

**Radius isn't always fixed either.** The zodiac ring is deliberately drawn off-center (eccentric) from the shared pivot — real astrolabe geometry, not a mistake (see `zodiac_ring.svg`, whose own center sits noticeably away from `(600,600)`). In the real Orloj, the Sun and Moon icons ride a peg that's constrained to the (rotating) eccentric zodiac ring, so their distance from the pivot slides in and out over the year even while their angle is driven by time-of-day. We haven't built that radial slide yet — today the Sun/Moon icons sit at a fixed radius on their arm. That's the natural next layer of complexity once the zodiac ring itself is rotating.

**Rotation status today:**
- **Sun arm** — the only one that's live. `src/clock/rotations.ts` → `sunHandRotationDegrees()`, fed by `usePragueTime()`. Formula: `degrees = fractionalHour × 15` (15°/hour, since the doubled I–XII Roman ring has 24 numeral positions around 360°). At 0° the arm's unrotated artwork already points straight down toward the fixed ring's bottom XII (midnight); 180° flips it to point up at the top XII (noon).
- **Moon arm, Star arm** — not wired up yet; currently static at rotation 0. Moon's rotation rate (~24h50m) and the Sun–Moon angular gap → phase-sphere spin are the next pieces once we get here.
- **Zodiac ring** — not wired up yet (sidereal rate, ~23h56m). Also carries the vertical gold gradient (see below), so it's ready to rotate as soon as we add the sidereal formula.
- **Roman ring** — never rotates. It's the fixed reference bezel the Sun/Moon hands read against.
- **Numeric ring** — does rotate in the real clock, but on an *annual* cycle tied to sunset drift (a completely different, much slower timescale than the hands) — not yet implemented.

**Gradient-bearing rings and counter-rotation.** `gold-trim`, `roman-ring`, `center-ring`, and `zodiac-ring` all carry the same vertical white → pale-yellow → warm-gold → bronze gradient. Because a plain `<img>` can't be reached into at runtime, those four are rendered by `GradientClockLayer` instead of `ClockLayer` — it fetches the raw SVG and inlines it into the DOM so a `useEffect` can set the `<linearGradient>`'s `gradientTransform` to the *inverse* of the layer's rotation on every render. The result: the ring artwork rotates normally, but the gold gradient always reads top-to-bottom on screen, never tilting with the ring.

## Tech stack

- **[React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)** — the whole app is a handful of function components and hooks; no routing, no state management library (plain `useState`/`useEffect` is enough so far).
- **[Vite](https://vite.dev/)** — dev server + build tooling. Client-only (no SSR needed for this kind of app).
- **Plain CSS** (`src/index.css`, `src/clock/ClockFace.css`) — no CSS framework or CSS-in-JS; layout is a handful of `position: absolute` layers plus flexbox centering.
- **[Oxlint](https://oxc.rs/docs/guide/usage/linter)** — linting (`npm run lint`).
- **[Playwright](https://playwright.dev/)** (dev-time only, not in `package.json`) — used ad hoc via `npx playwright screenshot`/a small script to visually verify changes in a headless browser during development; there's no automated test suite yet.
- No animation library — rotation is plain CSS `transform: rotate()`, computed each render from live time via React state.

## Project structure

- `public/clock/` — the traced SVG layers (background, gold trim, roman ring, center ring, zodiac ring, numeric ring, sun/moon/star dials), each sharing a 1200×1200 viewBox centered at (600, 600) so they align when stacked.
- `src/clock/` — the clock itself:
  - `ClockFace.tsx` — the layer stack (order, gradients, filters) and the live rotation wiring.
  - `ClockLayer.tsx` — renders a static layer as a plain `<img>`.
  - `GradientClockLayer.tsx` — renders a gradient-bearing layer inline (not `<img>`) so its `<linearGradient>` can be counter-rotated at runtime; see "Gradient-bearing rings" above.
  - `usePragueTime.ts` — live current time in `Europe/Prague`, DST-safe via `Intl.DateTimeFormat`.
  - `rotations.ts` — rotation-angle formulas (currently just the Sun hand).
  - `PragueTimeReadout.tsx` — small on-screen debug readout of the live time.
- `reference/` — the original Illustrator trace (`full_clock_trace.ai`) and reference imagery.
- `scripts/clean-svg-layers.py` — strips hidden Illustrator layers out of a freshly-exported SVG in `public/clock/` and prunes unused CSS. Re-run after re-exporting any layer from the `.ai` file.

## Getting started

```bash
npm install
npm run dev      # start the dev server with HMR
npm run build    # production build to dist/
npm run preview  # serve the production build locally
npm run lint     # run oxlint
```
