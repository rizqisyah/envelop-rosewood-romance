# Slicing notes — TemaRosewoodRomance

Built on `envelope-blue` (`F:\Undangan\qinvi\envelope-blue`): the same stack (Vite + Vue 3 + TS),
the same app shell, data layer and band architecture. What differs is how the art is cut: the
body here is placed from Figma's own geometry, not from per-node renders, so most of
envelope-blue's measuring toolchain was not needed.

Figma file **Desain Wesbite 25ribuaja** (`10VuhE58VrDL7mY7QUvMRl`), Page 1.

## The frames

| Frame | Node | Size | Built as |
|---|---|---|---|
| Frame 271 — cover | `3014:538` | 596 x 1183 | `src/components/cover/CoverSection.vue`, layers in `src/lib/coverLayers.ts` |
| Frame 270 — sheet | `3014:151` | 596 x 15058 | 14 bands in `src/components/sections/`, art tables in `src/lib/bands/*.ts` |

Both frames are **596 wide**: one design px is `100cqw / 596`, declared as `--px` on the cover
frame and on `.sheet`. Every coordinate in the code is a Figma frame px.

Frame 270's fill is `#efe8de` (`--sheet`). Frame 271's fill is the paper texture, `object-fit:
cover` over the frame; `--paper` is that texture's average.

## How the sheet is built

`scripts/frame270.py` is the source of truth. It holds every child of Frame 270 **in Figma paint
order**, transcribed from `get_design_context`, with Figma's own geometry:

- `box` — the node's axis-aligned box, exactly as get_design_context places it;
- `inner` + `rot` + `fy` — a rotated or flipped node: its unrotated size, centred in the box and
  turned (`rotate`, then `scale: 1 -1`, the order Figma and Tailwind v4 use — `rot 180 + fy` is
  a plain horizontal mirror);
- `crop` — the fill's placement inside the node, in %, when Figma crops rather than covers;
- `a`, `radius`, `shadow` (drop, follows the image's alpha), `inset` (inner), `mask`, `fit`.

```sh
python scripts/frame270.py     # regenerates src/lib/bands/*.ts and .figma-ref/frame270-layers.json
```

Never hand-edit `src/lib/bands/*.ts`. Change the script and rerun.

`z` is the child's index in the frame = the paint order. Bands share the sheet's stacking context
(`.sheet` is the only context), so a layer's `z` orders it against every other band's layers.
Live copy and CSS-drawn chrome keep their own node's slot (`kind 'live'` in the script) and each
section gives that number to its `z-index`. **Never give a band a `z-index` of its own.**

`BandArt.vue` renders a table with two elements per layer: the outer one is placed and runs the
entrance animation (it owns `transform`), the inner one carries Figma's rotation, flip, crop,
radius, shadow and mask, so the entrance never fights the design.

A layer belongs to the band its box TOP lands in, unless `BAND_OF` says otherwise. Art paints
across seams freely — a band's height is only the distance to the next band's top.

| Band | Top | Height | Notes |
|---|---|---|---|
| hero | 0 | 1160 | reveals on open (rootMargin 100%) |
| countdown | 1160 | 1070 | live countdown |
| greeting | 2230 | 170 | salam + "journey together" |
| groom | 2400 | 1290 | person slot 1 + "And" |
| bride | 3690 | 1060 | person slot 2 |
| quote | 4750 | 1080 | verse in the shield |
| akad | 5830 | 1200 | event 1 |
| resepsi | 7030 | 1160 | event 2 — dropped when the API sends one event |
| dresscode | 8190 | 840 | swatches are CSS |
| gallery | 9030 | 1170 | 880 without video, 640 without photos |
| gift | 10200 | 790 | ±204 per account beyond two |
| wishes | 10990 | 914 | follows the guest book's height |
| rsvp | 11904 | 1156 | |
| closing | 13060 | 1998 | the credit bar ends the frame at 15058 |

## Assets

One file per Figma fill under `src/assets/art/` (shared across bands — the sheet reuses most of
its florals), the cover's three under `src/assets/cover/`. Names are descriptive; the hash map is
`ASSETS` in `scripts/frame270.py`.

```sh
python scripts/assets_to_webp.py <body-fills-dir> <cover-fills-dir>
```

Download the fills first: get_design_context's asset URLs are `<prefix>/<hash>.<ext>` and expire
in 7 days. Each image is sized to 2.4x its largest render in design px (never upscaled), webp q84.
The script reproduces the committed files byte for byte. SVG glows are copied as they are.

## Figma traps found on this file

- **A fill's opacity can already be in its export.** get_design_context gives `Open (13) 1/2`
  (`3014:176`, `3023:164`) `opacity-56`, but the exported fill's alpha already tops out at 143
  (0.56 x 255) and Figma's own render of the node alone tops out at 142. Applying it again halved
  the event frame. The other two faded layers (`3018:657` at 0.90, `image 20/73/78/79` at 0.83) are
  real layer opacities and stay. Check any new `opacity-*` the same way: render the node alone
  with `get_screenshot(contentsOnly)` and read its maximum alpha.
- **Frame exports come back as PDF** (the nodes' own export settings). For a raster reference use
  `get_screenshot` at `maxDimension` = the frame's height — it never upscales, so that is 1x.
- `3018:564` / `3018:593` (two hedge bushes) have no visible fill; get_design_context emits empty
  boxes. They are `skip`ped.
- `3014:503` "Buat video prewed" is the designer's note on the video slot, not copy.
- The event cards' address (`3014:520`) is a left-aligned box that runs past its parent's clip and
  loses its trailing comma in the render. Here it is centred and wraps instead.
- The design prints `@Syifahadju` under both names, `BANK BCA / Alexander James Whitmore` as the
  second account, `Satrio & Istri` wishes and `Ahamd & Salma` as the signature — its template's
  leftovers. The handle and the demo account/wishes print in design mode only; the signature is
  always the couple's live nickname.

## Fonts

| Figma face | Token | Shipping as |
|---|---|---|
| Roben Elegante Script | `--font-script` | the real file, self-hosted. Demo cut, personal use only |
| Activists | `--font-caps` | the real file, self-hosted ("journey together") |
| Cormorant Infant 300/400/600 | `--font-serif` | fontsource |
| Lancelot, Pinyon Script, Ibarra Real Nova, Cinzel, Bellefair, EB Garamond, Abhaya Libre 800 | — | fontsource |
| Times New Roman | `--font-times`, `--font-arabic` | asked of the device first; Tinos (metric-compatible) and Amiri (Arabic) from fontsource behind it |
| Rose Gard ("And") | `--font-and` | the real file, self-hosted, at Figma's own 99.091 — ink box dx 0 / dy +1 |
| Perpetua (the salam) | `--font-greeting` | the real file (`Perpetua-Regular.otf`), self-hosted, at Figma's own 29.229 — line 1 exact, line 2 within 1px |
| Kaleagnetta (event titles) | `--font-hand` | the real file, self-hosted, at Figma's own 38 — ink box within 1px |
| Font Awesome 5 Brands (Instagram) | — | the exported glyph, `src/assets/art/instagram.webp` |

Every non-system face now ships as the design's own file. `Perpetua-Titling-Regular.otf` and the
Ibarra / Palisade-9MPa2 duplicates in `src/assets/fonts/` are not referenced by the code.
Roben Elegante, Rose Gard and Kaleagnetta look like demo cuts: check their licences before
shipping commercially.

## Measured offsets

Every live text node was checked by ink box (`scripts/ink-box.py`, keyed on the node's own fill)
against the 1x Figma render. Nearly all land within 1px at Figma's own coordinates. The ones that
needed a correction carry it in a comment where it is applied:

- Roben Elegante sits 1–2px high in Chrome at title sizes: cover/hero couple +2, Dresscode +2,
  Wedding Gift / Wishes +1.5, Rsvp +1, the closing copy +1;
- Activists ("journey together") +5;
- Perpetua, Rose Gard and Kaleagnetta carry no compensation at all;
- the akad title's first line keeps the design's trailing space (a no-break space in `useEvent.ts`),
  or the centred line sits 5px right of Figma's;
- the couple's title keeps the design's double space before "&" (`src/lib/text.ts`) — 12px of
  measure at that size.

## Verification

```sh
VITE_DESIGN_MODE=1 npm run dev -- --port 5181 &
node scripts/sheet-shot.mjs 5181                    # cover + sheet at 596, 1x, reduced motion
python scripts/band-diff.py .figma-tmp/ref/frame270-1x.png .figma-tmp/web-sheet-1x.png out.png <y0> <y1>
python scripts/ink-box.py   .figma-tmp/ref/frame270-1x.png .figma-tmp/web-sheet-1x.png <hex> <x0> <y0> <x1> <y1>
node scripts/shot.mjs 5181                          # phone 390@3x + desktop 1440, motion on
npm run dev -- --port 5182 &                        # live mode (no VITE_DESIGN_MODE)
node scripts/live-shot.mjs 5182                     # mocked getHome: 3 accounts, 5 photos, forms
```

`.figma-tmp/ref/` holds the 1x Figma renders of both frames (gitignored; re-take them with
`get_screenshot` if lost).

Mean absolute error against the render (0–255), design mode:

| cover | hero | countdown | greeting | groom | bride | quote | akad | resepsi | dresscode | gallery | gift | wishes | rsvp | closing | **sheet** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2.69 | 3.34 | 2.49 | 4.17 | 1.85 | 2.65 | 3.04 | 2.6 | 2.75 | 1.70 | 3.00 | 2.65 | 3.50 | 1.28 | 3.73 | **2.73** |

The countdown's figures are live (the render prints 0s); the rest is glyph anti-aliasing and webp.

## Behaviour notes

- **Design mode** (`VITE_DESIGN_MODE=1`) renders the frames' own copy and never calls the API;
  the forms answer locally. Without it the app fetches `getHome/<slug>`; the demo accounts and
  photos never stand in for a live wedding, even one whose request failed.
- `useReveal` also reveals a band that has gone ABOVE the viewport — a fling or a restored scroll
  can carry a band past the fold between two frames and its observer would never fire, leaving
  its art (which paints into the bands below) hidden.
- `useFitText` refits when its text changes, not only when its box does: live names arrive a
  request after mount, into boxes of a fixed size.
- The gallery does not auto-advance under `prefers-reduced-motion`.


## Qinvi backend + admin-dashboard (local)

Theme code **`TemaRosewoodRomance`**, demo slug **`tema-rosewood-romance`**. Registered in `F:\Undangan\qinvi`:

- `src/config/themes/tema-rosewood-romance.config.ts` (+ `src/db/seed-themes.ts`) — the theme row
- `src/config/theme-fields/catalog.ts` — the "Field per Tema" preset `temarosewoodromance`
- `src/modules/ssr/ssr.controller.ts` — localhost dev redirect to `:5174`
- `src/db/seed-wedding-rosewood-romance.ts` — the demo wedding (`npm run db:seed:rosewood-romance`)
- `admin-dashboard/src/tabs/TabThemeOverride.tsx` — hero/spouse photo controls, Arabic ayah, salam
  and dresscode editors now include this theme (admin-dashboard is its own git repo)

Run locally: Postgres (`qinvi_db`), `npm run dev` in qinvi (:3000), `npm run dev` in
`admin-dashboard` (:5173), and here `npm run dev` with a `.env`
(`VITE_API_PROXY_TARGET=http://localhost:3000`, gitignored). Open
`http://localhost:5174/TemaRosewoodRomance/tema-rosewood-romance?to=Nama%20Tamu`.

Verified end to end: getHome renders every band from the database, and a wish and an RSVP posted from
the page land in the `ucapan` and `hadir2` tables. Production still needs the theme row and the demo
wedding seeded (`db:seed:rosewood-romance:prod`; the theme row comes from `db:seed:themes:prod`).

### Mode Imajinasi, realtime

The dashboard's phone preview (`App.tsx`, iframe `?preview=true`) now follows edits while they are typed,
not only after Save. `window` event `qinvi-preview-update` -> `QINVI_PREVIEW_UPDATE` message, carrying
`wedding` / `theme` / `content` / `refetch`. `useWedding.ts` merges `content` (`pengantin`, `acara`,
`rekening`, `gallery`, `ucapan` — each key replaces that list) on top of the API data.

Drafts are sent by `admin-dashboard/src/utils/livePreview.ts` (`useDraftPreview`, debounced 150ms) from:
Tema (already did), Umum (title, countdown, music, video, spouse photo, order), Pengantin, Acara
(sorted by `sort_order`; closing the form puts the saved list back) and Rekening. Gallery, Story, SEO and
the media uploader still refresh on Save. Test the theme side without the dashboard with
`.figma-tmp/rt.mjs`-style `window.postMessage({ type: 'QINVI_PREVIEW_UPDATE', content: { ... } })`.

### Mode Imajinasi, realtime

The dashboard's phone preview (`App.tsx`, iframe `?preview=true`) now follows edits while they are typed,
not only after Save. `window` event `qinvi-preview-update` -> `QINVI_PREVIEW_UPDATE` message, carrying
`wedding` / `theme` / `content` / `refetch`. `useWedding.ts` merges `content` (`pengantin`, `acara`,
`rekening`, `gallery`, `ucapan` — each key replaces that list) on top of the API data.

Drafts are sent by `admin-dashboard/src/utils/livePreview.ts` (`useDraftPreview`, debounced 150ms) from:
Tema (already did), Umum (title, countdown, music, video, spouse photo, order), Pengantin, Acara
(sorted by `sort_order`; closing the form puts the saved list back) and Rekening. Gallery, Story, SEO and
the media uploader still refresh on Save. Test the theme side without the dashboard with
`.figma-tmp/rt.mjs`-style `window.postMessage({ type: 'QINVI_PREVIEW_UPDATE', content: { ... } })`.
