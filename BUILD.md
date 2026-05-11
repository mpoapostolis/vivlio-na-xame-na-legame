# Ι.Ν. Ἁγίου Ἀνδρέου Πατρῶν · 3D Educational Web App

Astro · three.js · WebGPU · WebXR · PocketBase · Capacitor APK · Polytonic Greek.

A multi-page educational experience around the Cathedral of Saint Andrew of Patras: a 3D interactive book, a chronological timeline, a photo gallery, an educational quiz, and a live CMS for editors. Content (page text, photos, narrations, animations) is served from a remote PocketBase instance, with safe inline defaults if the backend is unreachable.

---

## 1. Quick start

```bash
npm install                  # Astro 4 + three.js r172 + pocketbase + capacitor
npm run dev                  # http://localhost:3000 (host:true → also reachable on LAN)
```

Open **http://localhost:3000**. The dev server hot-reloads on every save.

Other npm scripts:

| Script                       | What it does                                                    |
|------------------------------|-----------------------------------------------------------------|
| `npm run dev`                | Astro dev server on port 3000, exposed on the LAN               |
| `npm run build`              | Static production build → `dist/`                               |
| `npm run preview`            | Serve `dist/` locally on port 3000                              |
| `npm run narrations`         | Regenerate Greek TTS mp3s (macOS, `say -v Melina` + `ffmpeg`)   |
| `npm run android:add`        | Build + `npx cap add android` (one time)                        |
| `npm run android:sync`       | Build + `npx cap sync android`                                  |
| `npm run android:open`       | Build + sync + open Android Studio                              |
| `npm run android:build:debug`| Build + sync + `./gradlew assembleDebug` → debug APK            |

---

## 2. Architecture

```
                    ┌────────────────────────────────────────┐
                    │     PocketBase  https://yms.galerra.art │
                    │                                          │
                    │   church_pages       16+ records        │
                    │   church_animations   2 records         │
                    │   users               auth collection   │
                    └───────────┬──────────────┬───────────────┘
                                │              │
                          public │              │ authed (token)
                          GET    │              │ GET / PATCH / POST / file uploads
                                 │              │
            ┌────────────────────▼──┐        ┌──▼──────────────────────┐
            │      /book            │        │      /admin              │
            │   reads pages + anims │        │   reads + writes pages   │
            │   at runtime, replaces│        │   + animations, uploads  │
            │   inline defaults     │        │   files (photo / audio)  │
            │                       │        │   live-preview iframe → /book
            └────────────────────┬──┘        └──┬──────────────────────┘
                                 │              │
                                 ▼              ▼
                          ┌──────────────────────────────┐
                          │       Browser (client)        │
                          │  Astro static HTML + JS bundle│
                          │  Three.js scene, audio player │
                          └──────────────────────────────┘

         ┌─ if PB fetch fails ──────────────────────────────────────────┐
         │  /book logs "[content] PB unreachable — using inline         │
         │  defaults" and renders the hand-written pages from           │
         │  book.astro. The 3D book is fully functional offline.        │
         └──────────────────────────────────────────────────────────────┘
```

Notes:

- The Astro build is fully static (`output: 'static'`). All PB I/O happens in the browser.
- `/book` only reads — no auth needed. PB collections `church_pages` and `church_animations` have public list/view rules.
- `/admin` writes. It authenticates against the `users` collection (PB auth) and stores the JWT in `localStorage` under the key `church.cms.token`.
- The fallback path matters: if the PB instance is down, slow, or the device is offline, `/book` still renders. The shipped Astro HTML contains the inline defaults; PB data only patches over them.

---

## 3. Project structure

Verified by `ls`:

```
threej/
├── src/
│   ├── pages/                      # one file per route (Astro file-based routing)
│   │   ├── index.astro             # landing
│   │   ├── book.astro              # 3D book (immersive, ~1750 lines)
│   │   ├── chronicle.astro         # text timeline
│   │   ├── gallery.astro           # photo grid + lightbox
│   │   ├── quiz.astro              # 12-question quiz
│   │   ├── about.astro             # credits, sources, tech
│   │   └── admin.astro             # CMS (~1650 lines, two-tab editor)
│   ├── layouts/
│   │   ├── BaseLayout.astro        # shared shell w/ Header + Footer
│   │   └── ImmersiveLayout.astro   # full-bleed (used by /book and /admin)
│   ├── components/
│   │   ├── Header.astro            # top nav (consumes data/nav.ts)
│   │   └── Footer.astro
│   ├── data/                       # typed seed / config data
│   │   ├── nav.ts                  # 7 nav entries (incl. /admin)
│   │   ├── chronicle.ts            # 12 chronicle events
│   │   ├── photos.ts               # 10 photos with categories
│   │   ├── quiz.ts                 # 12 questions across 4 categories
│   │   └── animations.ts           # 4 default keyframe animations + audio map
│   ├── lib/                        # shared client-side modules
│   │   ├── pb.ts                   # PocketBase client + typed helpers
│   │   ├── keyframe-player.js      # JSON-driven property-animation runtime
│   │   └── narrations.js           # singleton audio player
│   ├── styles/global.css           # design system (palette, fonts, helpers)
│   └── env.d.ts
├── public/                          # served as-is at /
│   ├── photos → ../assets           # symlink to church photos
│   └── audio  → ../assets/audio     # symlink to narration mp3s
├── assets/                          # raw assets (committed)
│   ├── church_page-*.jpg, themelios.jpg   # 10 historic photos
│   └── audio/                       # 18 Greek TTS mp3s (8 page + 10 photo)
├── tools/
│   ├── generate_narrations.py       # Greek TTS via macOS Melina + ffmpeg
│   ├── pb-setup.sh                  # idempotent: creates the two PB collections
│   ├── pb-seed.py                   # seeds 16 pages + 2 animations into PB
│   └── sync-www.sh                  # legacy: copy old book.html to www/
├── legacy/                          # archived monolithic prototypes
│   ├── book.html, cms.html, index.html
│   ├── package.legacy.json
│   └── www/
├── astro.config.mjs                 # static output, port 3000, trailingSlash:'never'
├── capacitor.config.json
├── package.json
├── tsconfig.json
└── BUILD.md
```

---

## 4. The 6 public pages

| Route        | Greek title       | What it does                                                                                       |
|--------------|-------------------|----------------------------------------------------------------------------------------------------|
| `/`          | Ἀρχή              | Landing · hero, era strip, app cards, stats, photo strip, CTA                                       |
| `/book`      | Τὸ Βιβλίον        | Immersive 3D book · WebGPU (with WebGL2 fallback), skinned-mesh page bend, photo lift-off, per-page and per-photo narration. Reads pages and animations from PocketBase at runtime; falls back to inline defaults if PB is unreachable. |
| `/chronicle` | Χρονικόν          | Vertical timeline · 12 events with year, title, body, photo, narration play button                  |
| `/gallery`   | Συλλογή           | Photo grid · 5 category filters, lightbox with prev/next + auto-play narration                     |
| `/quiz`      | Γνώρισέ τον       | 12 multiple-choice questions · score ring, category tags, per-question explanations                |
| `/about`     | Περὶ τοῦ ἔργου    | Credits, sources, technology stack, full project scope notes                                       |

The seventh entry in `src/data/nav.ts` is `/admin` (διαχείρισις) — the CMS, documented below.

---

## 5. The `/admin` CMS

Single-page app at `/admin.astro`. Login required. Two top-level tabs share a sticky toolbar and an optional live-preview iframe.

### Login

- Login form authenticates by `email` + `password` against the PocketBase `users` collection (POST `…/api/collections/users/auth-with-password`).
- On success the JWT is stored in `localStorage` under `church.cms.token` and reused on the next visit (with `exp` checked from the payload).
- Logout clears the token; if there are unsaved changes the app first asks for confirmation.

### Toolbar (visible in both tabs)

- `↶ undo` (Ctrl/Cmd + Z) · `↷ redo` (Ctrl/Cmd + Shift + Z, also Ctrl/Cmd + Y)
- `💾 save` (Cmd/Ctrl + S) — pushes all dirty pages and animations to PB
- `📖 preview pane` — toggles a side iframe pointing at `/book` for live verification
- `↗ open book` — opens `/book` in a new tab

### Tab 1 — **σελίδες** (pages content)

- Left rail: list of 16+ pages from `church_pages`, sorted by `order`. Selecting one opens the field form on the right.
- Form fields, all bound to PB columns: `eyebrow`, `title`, `date`, `lead` (HTML), `body` (HTML), `photo` (file), `photo_title`, `photo_cap`, `photo_desc` (HTML), `photo_italic`, `narration` (mp3 file), `photo_audio` (mp3 file).
- Inline previews: a thumbnail of the uploaded photo and `<audio>` elements for both narration tracks.
- **Per-field lock**: each row has a `🔒 lock` checkbox. Locked field names are persisted to the page's `locked_fields` JSON column and rendered visually disabled on next load. Use this to freeze content while iterating on other fields.
- **+ νέα σελίδα** button: creates a fresh `church_pages` record at `order = max + 1`, derives `book_index` and `side` automatically (even `order` → `front`, odd → `back`), and selects it in the editor.
- File uploads: when any file field has a new pick, save uses `multipart/form-data` so the binary goes through alongside the text fields in a single PATCH.

### Tab 2 — **animations** (keyframe editor)

- Left rail: list of animations from `church_animations`.
- Center: a ruler-based timeline view with one row per track, draggable keyframe handles, and a playhead.
- Right: inspector showing the selected keyframe's `t`, value, ease, and per-track lock toggles.
- Playback: `Space` plays/pauses the active animation.
- Delete keyframe: `Delete` or `Backspace` while a handle is selected.
- New animation, delete animation, and duration editing are also exposed as toolbar buttons in the animations view.

### Shared preview pane

- Slides in from the right (`42vw` wide, falls back to fullscreen below 1180 px).
- Iframe `src` is `/book`; on save it reloads automatically so edits are visible immediately.

### Persistence model

- Edits are buffered in memory under `State.content` / `State.animations` / `State.dirtyPages` / `State.dirtyAnims`.
- `save()` PATCHes each dirty page record (JSON when no files, multipart when there are files) and each dirty animation record.
- `beforeunload` warns when the page would close with unsaved changes.

---

## 6. PocketBase backend

Live instance: **https://yms.galerra.art**. The app coexists with other projects on the same PB; everything app-specific is namespaced under `church_*`.

### Collections

| Collection         | Records (approx) | Purpose                                                        |
|--------------------|------------------|----------------------------------------------------------------|
| `church_pages`     | 16+              | Content per logical page (2 sides × N sheets); editor + admin  |
| `church_animations`| 2                | Keyframe animation definitions consumed by the book runtime    |
| `users`            | n/a              | Existing PB auth collection · CMS editors live here            |

### `church_pages` schema highlights

| Field           | Type                  | Notes                                                       |
|-----------------|-----------------------|-------------------------------------------------------------|
| `order`         | number (unique, 0–15) | Sort key                                                    |
| `book_index`    | number (0–7)          | Sheet index                                                 |
| `side`          | select                | `front` or `back`                                           |
| `label`         | text (required)       | Sidebar label in CMS                                        |
| `eyebrow`       | text                  | Small label above the title                                 |
| `title`         | text                  | Page title (allows `\n` for line breaks in book)            |
| `date`          | text                  | Free-form date or range                                     |
| `lead`          | editor (HTML)         | Lead paragraph                                              |
| `body`          | editor (HTML)         | Body paragraph                                              |
| `photo`         | file (image, ≤ 15 MB) | Up to one image                                             |
| `photo_title`, `photo_cap`, `photo_italic` | text | Photo overlay text   |
| `photo_desc`    | editor (HTML)         | Long description shown in the photo modal                    |
| `narration`     | file (audio, ≤ 20 MB) | Page-level narration mp3                                    |
| `photo_audio`   | file (audio, ≤ 20 MB) | Photo-level narration mp3 (plays when the photo lifts off)  |
| `locked_fields` | json                  | Array of field names the editor has locked                  |

### `church_animations` schema highlights

| Field        | Type            | Notes                                                  |
|--------------|-----------------|--------------------------------------------------------|
| `anim_name`  | text (unique)   | Stable identifier referenced from the book code        |
| `duration`   | number (0.05–60)| Seconds                                                |
| `loop`       | bool            | Wrap when time exceeds `duration`                      |
| `tracks`     | json (required) | Array of `{ target, properties }`                      |
| `track_locks`| json            | Per-track lock map (used by /admin)                    |
| `description`| text            | Human note                                             |

### Security rules

Both `church_*` collections share the same rule shape:

- `listRule` / `viewRule`: empty string → **public read** (so `/book` can fetch without a token)
- `createRule` / `updateRule` / `deleteRule`: `@request.auth.collectionName = 'users'` → **write only by tokens issued from `users`**

This makes the public site fully readable from any browser while restricting mutations to authenticated CMS editors.

### One-time setup (already executed on the hosted instance)

```bash
export PB_TOKEN="<a token authorized to manage collections>"
bash tools/pb-setup.sh        # creates the two church_* collections (idempotent)
python3 tools/pb-seed.py      # seeds 16 pages + 2 animations
```

### Creating a CMS user

1. Open `https://yms.galerra.art/_/` (PB's admin UI) and log in.
2. Navigate to the `users` collection.
3. Click **+ New record**, set `email` and `password` (and optional `name`).
4. Save. The new user can log in at `/admin`.

---

## 7. Animation system

JSON-driven runtime defined in `src/lib/keyframe-player.js`. Default animations live in `src/data/animations.ts`; PB records in `church_animations` can override or extend them at runtime.

### Keyframe data shape

```ts
{
  duration: 0.75,        // seconds
  loop: false,
  tracks: [
    {
      target: 'photoMesh',                // matched at runtime to a THREE.Object3D
      properties: {
        position: [
          { t: 0.0, value: '$startPos',   ease: 'easeOutBack' },
          { t: 1.0, value: '$photoTarget' },
        ],
        scale: [
          { t: 0.0, value: 0.30, ease: 'easeOutBack' },
          { t: 1.0, value: 1.00 },
        ],
      },
    },
  ],
}
```

- `t` — normalized 0..1 (multiplied by `duration` at runtime).
- `value` — number, `[x, y, z]`, `THREE.Vector3`, or `"$bindingName"` (resolved per frame).
- `ease` — one of the keys in the `EASE` registry (see below).
- Supported properties: `position`, `scale`, `rotation`, `opacity`, and dotted paths like `scale.x` or `material.metalness`.

### Ease functions (12 built-in)

`linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeInQuart`, `easeOutQuart`, `easeOutBack`, `easeOutElastic`, `easeOutBounce`.

### Default animations

| Name             | What it does                                                                       |
|------------------|------------------------------------------------------------------------------------|
| `photoLiftOff`   | 0.75 s. Photo + info panel + dim plane stagger into the foreground when tapped.     |
| `photoLiftClose` | 0.5 s reverse with `easeInCubic`.                                                  |
| `bookOpenSwoosh` | 0.6 s scale settle on first load (rotation track disabled — see code comment).      |
| `pageNudge`      | 0.45 s wiggle when the user tries to navigate past a page boundary.                 |

### Adding a new animation

1. Open `/admin`, switch to the **animations** tab.
2. Click **+ νέα animation**, give it a `name` and `duration`.
3. Add tracks: each track needs a `target` string that matches an `Object3D` registered in the book scene.
4. Add property keyframes via the timeline UI; set `ease` per keyframe in the inspector.
5. Save. The book code can now call `player.play('yourAnimName', { targets, bindings })`.

To add it from code instead, append an entry to `ANIMATIONS` in `src/data/animations.ts` and reload.

---

## 8. Audio narrations

Static mp3s ship in `assets/audio/` (18 files, ~2.6 MB total):

- `narration_p0.mp3` … `narration_p7.mp3` — 8 per-page narrations used by `/book` and `/chronicle`
- `photo_<slug>.mp3` — 10 per-photo narrations (one per archive photo)

PB also stores narration and `photo_audio` files alongside each `church_pages` record. The book code prefers the PB URL when present and falls back to the static path mapped in `src/data/animations.ts` (`NARRATIONS` and `PHOTO_NARRATIONS`).

### Regenerating

```bash
npm run narrations           # python3 tools/generate_narrations.py
```

Requirements (macOS only):

- Built-in `say` command with the **Melina** Greek voice (System Settings → Accessibility → Spoken Content → System Voices → Greek).
- `ffmpeg` with `libmp3lame` on the PATH.

What the script does:

1. Reads polytonic Greek strings in the `PAGES` and `PHOTOS` dicts at the top of `tools/generate_narrations.py`.
2. Normalises polytonic → monotonic via `unicodedata` (Melina pronounces monotonic more cleanly).
3. Calls `say -v Melina -r 165 -o <file>.aiff "<text>"`.
4. Pipes through `ffmpeg -codec:a libmp3lame -b:a 96k` into `assets/audio/<name>.mp3`.

To edit narration text, change the strings in `tools/generate_narrations.py` and re-run.

---

## 9. Android APK build

Capacitor is configured to wrap the Astro static build into an Android APK.

`capacitor.config.json`:

```json
{
  "appId":   "gr.patras.agiosandreas",
  "appName": "Ἅγιος Ἀνδρέας",
  "webDir":  "dist",
  "server":  { "androidScheme": "https", "cleartext": true },
  "android": { "allowMixedContent": true, "buildOptions": { "releaseType": "APK" } },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 800,
      "backgroundColor":    "#0c0604",
      "androidSplashResourceName": "splash",
      "showSpinner": false
    }
  }
}
```

### Debug APK (typical loop)

```bash
npm install                                # one time
npm run android:add                        # one time — builds + `cap add android` → ./android/
npm run android:build:debug                # build + sync + gradle assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (signed)

```bash
keytool -genkey -v -keystore release.keystore -alias agiosandreas \
        -keyalg RSA -keysize 2048 -validity 10000
# configure signing in android/app/build.gradle
npm run build && npx cap sync android
cd android && ./gradlew assembleRelease
```

The release APK lands in `android/app/build/outputs/apk/release/`.

---

## 10. Keyboard shortcuts

### `/book`

| Key            | Action                                     |
|----------------|--------------------------------------------|
| `←` `→`        | Previous / next page                       |
| `Space`        | Next page                                  |
| `Esc`          | Close photo modal · stop narration         |
| click photo    | Lift-off animation + auto-play narration   |

### `/admin`

| Key                            | Action                                  |
|--------------------------------|-----------------------------------------|
| Cmd/Ctrl + `Z`                 | Undo                                    |
| Cmd/Ctrl + Shift + `Z` / Y     | Redo                                    |
| Cmd/Ctrl + `S`                 | Save all dirty records                  |
| `Space`                        | Play / pause animation (animations tab) |
| `Delete` / `Backspace`         | Delete selected keyframe                |

(Shortcuts are suppressed while typing into an input, textarea, or select.)

### `/gallery`

| Key            | Action                                  |
|----------------|-----------------------------------------|
| click tile     | Open lightbox + auto-play narration     |
| `←` `→`        | Previous / next photo                   |
| `Esc`          | Close lightbox                          |

### `/chronicle`

| Action                         | Result                                          |
|--------------------------------|-------------------------------------------------|
| click ▶ on an entry            | Plays that entry's narration (one at a time)    |

### `/quiz`

| Action            | Result                                                |
|-------------------|-------------------------------------------------------|
| click an answer   | Reveals correct answer + explanation                  |
| click ἑπόμενη     | Advance to next question                              |
| click ἀρχίζω πάλι | Restart the quiz from the result screen               |

---

## 11. What's done · what's pending

### Done

- 7-route Astro app (6 public + 1 admin) with shared layouts, header, footer, view transitions, polytonic Greek throughout.
- `/book` immersive scene: skinned-mesh page bending, WebGPU with WebGL2 fallback, WebXR-ready, photo lift-off animation, page-level + photo-level narration.
- JSON-driven keyframe animation runtime with 12 ease functions and `$binding` resolution.
- Photo gallery with category filtering, lightbox, auto-play narration.
- 12-question educational quiz with explanations and per-category tagging.
- Chronicle timeline with 12 events and inline audio.
- About page with credits and full scope notes.
- PocketBase integration: public reads on `church_pages` / `church_animations`, authed writes via `users` JWTs, file uploads for photos and audio.
- Live CMS at `/admin`: two-tab editor (σελίδες · animations), per-field locks, undo/redo, dirty tracking, save-all, side-by-side `/book` preview iframe, **+ νέα σελίδα** to add records on the fly.
- Fallback: `/book` renders correctly even when the PB instance is unreachable (uses the hand-written inline defaults in `book.astro`).
- 18 prebuilt Greek TTS narrations (8 page + 10 photo).
- Capacitor wired up — `dist/` is the `webDir`, gradle commands available via npm scripts.

### Pending

- iOS build (`npx cap add ios` requires macOS-only setup; not wired into npm scripts).
- VR-controller pointer interaction in the book scene (WebXR is present but controller picking is not implemented).
- Page-pair management UI (sides are edited independently; no batch operations across front/back of the same sheet).
- Multiple selectable 3D environments (currently a single candle-lit interior).
- Additional educational apps (Virtual Museum, AR variant, themed lessons) referenced in the about page scope.
- Signed-release pipeline (`build.gradle` signing block + keystore management — manual today).

---

## Credits

- Educational material: Ι.Ν. Ἁγίου Ἀνδρέου Πατρῶν (archive).
- Three.js r172 (WebGPU build) · Astro 4.x · PocketBase 0.26 · Capacitor 6.
- Polytonic display font: Cormorant Garamond. Body font: Inter.
- TTS voice: macOS Melina (el_GR, built-in).
