# Ι.Ν. Ἁγίου Ἀνδρέου Πατρῶν · 3D Educational Web App

Astro · three.js · WebGPU · WebXR · Capacitor APK · Greek polytonic.

A multi-page educational experience around the Cathedral of Saint Andrew of Patras, with a 3D interactive book, a chronological timeline, a photo gallery, and an educational quiz.

---

## Quick start

```bash
npm install                # install Astro + three + capacitor
npm run dev                # http://localhost:3000
```

Open **http://localhost:3000** in a browser. The dev server hot-reloads on every save.

---

## Project structure

```
threej/
├── src/
│   ├── pages/                   # one file per route (Astro file-based routing)
│   │   ├── index.astro          # landing — hero + 4 app cards + photo strip
│   │   ├── book.astro           # 3D book (immersive, no chrome)
│   │   ├── chronicle.astro      # text timeline with photos + narration
│   │   ├── gallery.astro        # photo grid + lightbox + 5 category filters
│   │   ├── quiz.astro           # 12-question educational quiz
│   │   └── about.astro          # credits, technology, sources
│   ├── layouts/
│   │   ├── BaseLayout.astro     # shared shell w/ Header + Footer
│   │   └── ImmersiveLayout.astro# full-bleed, no chrome (used by /book)
│   ├── components/
│   │   ├── Header.astro         # top nav
│   │   └── Footer.astro
│   ├── data/                    # typed data files
│   │   ├── chronicle.ts         # 12 chronicle events with metadata
│   │   ├── photos.ts            # 10 photos with categories
│   │   ├── quiz.ts              # 12 questions across 4 categories
│   │   ├── animations.ts        # keyframe animation definitions
│   │   └── nav.ts               # nav links
│   ├── lib/                     # shared client-side modules
│   │   ├── keyframe-player.js   # JSON-driven property animation runtime
│   │   └── narrations.js        # singleton audio player
│   └── styles/
│       └── global.css           # design system (palette, fonts, helpers)
├── public/
│   ├── photos/ → ../assets      # symlinked church photos
│   └── audio/  → ../assets/audio # symlinked narration mp3s
├── assets/                       # raw assets (committed)
│   ├── *.jpg                    # historic photos
│   └── audio/                   # 18 Greek TTS mp3s
├── tools/
│   ├── generate_narrations.py   # Greek TTS via macOS Melina + ffmpeg
│   └── sync-www.sh              # legacy: copy book.html to www/ (unused now)
├── legacy/                       # old monolithic book.html, cms.html
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── capacitor.config.json
└── BUILD.md
```

---

## Pages

| Route        | Title                          | What it does |
|---|---|---|
| `/`          | Ἀρχή                          | Landing page · hero · 4 app cards · stats · photo strip · CTA |
| `/book`      | Τὸ Βιβλίον                    | Full 3D book with WebGPU, page-flip animation, keyframe lift-off |
| `/chronicle` | Χρονικόν                       | Vertical timeline · 12 events · year + title + body + photo · auto-narration |
| `/gallery`   | Συλλογή                       | Photo grid · 5 category filters · lightbox with prev/next + narration |
| `/quiz`      | Γνώρισέ τον                   | 12 multiple-choice questions · score ring · category tags · explanations |
| `/about`     | Περὶ τοῦ ἔργου                | Credits, sources, technology, full ΥΛΟΠΟΙΗΣΗ scope details |

---

## Audio narrations

Already generated, in `assets/audio/` (18 files):

- `narration_p0.mp3` … `narration_p7.mp3` — per-page (used in book + chronicle)
- `photo_*.mp3` — per-photo (auto-play in book and gallery lightbox)

To regenerate (after editing the texts in `tools/generate_narrations.py`):

```bash
npm run narrations
```

Requires macOS with the **Melina** Greek voice (built-in) and `ffmpeg`.

---

## Building Android APK with Capacitor

```bash
npm install                                # one time
npm run build                              # Astro static build → dist/
npx cap add android                        # one time — creates ./android/
npm run android:build:debug                # builds APK via gradle
# → android/app/build/outputs/apk/debug/app-debug.apk
```

Capacitor's `webDir` is set to `dist/` so the APK ships with the production-built static site.

### Release APK (signed)

```bash
keytool -genkey -v -keystore release.keystore -alias agiosandreas \
        -keyalg RSA -keysize 2048 -validity 10000
# configure signing in android/app/build.gradle
npm run build && npx cap sync android
cd android && ./gradlew assembleRelease
```

---

## Backend · PocketBase

The CMS data lives on a PocketBase instance at `https://yms.galerra.art`.

### Collections (additive — coexists with other apps on the same PB)

| Collection         | Purpose                                            |
|--------------------|----------------------------------------------------|
| `church_pages`     | 16 records — content per logical page (8 sheets × 2 sides) |
| `church_animations`| 2 records — keyframe animation definitions         |
| `church_admins`    | Auth collection — **CMS editors log in here**      |

### One-time setup (already executed on the hosted instance)

```bash
export PB_TOKEN="<your PB admin token>"
bash tools/pb-setup.sh        # creates the three collections (idempotent)
python3 tools/pb-seed.py      # seeds 16 pages + 2 animations
```

### Creating a CMS user

1. Open `https://yms.galerra.art/_/` and log in
2. Navigate to the `church_admins` collection
3. Click **+ New record**, set `email` + `password` (+ optional `name`)
4. Save

That user can now log in at `/admin` in this app.

### Security model

- `church_pages` / `church_animations`: **public read** (so `/book` works without auth) · **write only by `church_admins`**
- The PB `/_/` backend is for collection schema / record management; the running app never authenticates with those credentials.

---

## Animation system (keyframe runtime)

The book uses a custom JSON-driven runtime defined in `src/data/animations.ts` and executed by `src/lib/keyframe-player.js`.

### Example animation

```ts
photoLiftOff: {
  duration: 0.75,
  tracks: [{
    target: 'photoMesh',
    properties: {
      position: [
        { t: 0.0, value: '$startPos',    ease: 'easeOutBack' },
        { t: 1.0, value: '$photoTarget' },
      ],
      scale: [
        { t: 0.0, value: 0.30, ease: 'easeOutBack' },
        { t: 1.0, value: 1.00 },
      ],
    },
  }],
}
```

- `t` — normalized 0..1 (multiplied by `duration` at runtime)
- `value` — number, `[x,y,z]`, or `"$bindingName"` (function resolved per frame)
- `ease` — 12 built-in ease functions (linear, quad, cubic, quart, back, elastic, bounce)
- Properties supported: `position`, `scale`, `rotation`, `opacity`, dotted paths (`scale.x`, `material.metalness`)

### Built-in animations
- `photoLiftOff` — 8 keyframes across 3 targets (photo + info panel + dim plane), staggered
- `photoLiftClose` — reverse with `easeInCubic`
- `bookOpenSwoosh` — book scales + rotates into place on first load
- `pageNudge` — book wiggles when user navigates past page boundary

### Debug timeline
In the book, press **T** to toggle a live timeline overlay showing tracks, keyframes, and the playhead.

---

## Keyboard shortcuts

### Book (`/book`)
- `←` `→` page turn
- `Space` next page
- `T` toggle keyframe debug timeline
- `Esc` close photo modal + stop narration
- click photo → lift-off animation + auto-play narration

### Gallery (`/gallery`)
- click tile → open lightbox + auto-play narration
- `←` `→` previous / next photo
- `Esc` close lightbox

### Chronicle (`/chronicle`)
- click play button → play that entry's narration (single playback at a time)

### Quiz (`/quiz`)
- click answer → reveals correct + explanation
- click "ἑπόμενη" → next question
- click "ἀρχίζω πάλι" on result → restart

---

## Greek TTS generation

`tools/generate_narrations.py`:

1. Reads polytonic Greek texts per page + per photo
2. Normalizes to monotonic via `unicodedata` (Melina voice handles monotonic best)
3. Calls macOS `say -v Melina -r 165 -o file.aiff "..."` for synthesis
4. Converts to mp3 via `ffmpeg + libmp3lame` @ 96kbps
5. Writes to `assets/audio/`

To edit narration texts, modify the `PAGES` and `PHOTOS` dicts at the top of the script.

---

## Done · Pending

### ✅ Done (Sample-quality, ready to ship)
- 6-page Astro multi-page app with shared layouts/components
- 3D book with skinned-mesh page bending (wawa formula port), WebGPU + WebGL2 fallback, WebXR for Quest
- JSON-driven keyframe animation runtime with 12 ease functions and dynamic bindings
- Polytonic Greek throughout (NFC normalized)
- 18 Greek TTS narrations (8 page + 10 photo) auto-generated with macOS Melina
- Photo gallery with category filtering + lightbox + auto-play narration
- 12-question educational quiz with score ring + per-question explanations
- Mobile-responsive design across all pages
- Capacitor configured to ship the Astro build as an Android APK
- View Transitions enabled between pages

### ❌ Pending (Full ΥΛΟΠΟΙΗΣΗ scope beyond the sample)
- iOS build (`npx cap add ios` after macOS-only setup)
- 4 more educational apps (Virtual Museum + AR + 3 more themes)
- VR controller pointer interaction in the book scene
- Page-pair management UI (currently each page is independent)
- Multiple selectable 3D environments (currently single candle-lit)
- Live-edit CMS for content (explicitly excluded per directive)

---

## Credits

- Educational material: Ι.Ν. Ἁγίου Ἀνδρέου Πατρῶν (archive)
- Three.js r172 (WebGPU build)
- Astro 4.x
- Polytonic font: Cormorant Garamond (Google Fonts)
- Body font: Inter (Google Fonts)
- TTS voice: macOS Melina (el_GR, built-in)
