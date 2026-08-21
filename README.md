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

## Project structure

- `public/clock/` — the traced SVG layers (background, gold trim, center ring, numeric ring, roman ring, zodiac ring), each sharing a 1200×1200 viewBox centered at (600, 600) so they align when stacked.
- `src/clock/` — `ClockFace` (stacks and centers the layers, scaled to fill the viewport) and `ClockLayer` (renders one layer, rotatable around its center).
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
