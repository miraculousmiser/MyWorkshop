# The Workshop — version 0.1

A static personal website and long-term creative playground for browser games, economic philosophy, books, music, and interactive experiments.

Version 0.1 establishes five pages:

- Home
- Arcade
- Library
- Listening Room
- Laboratory

The Arcade includes Pocket Weather, Orbital Orchard, and Ledger Runner. The Listening Room includes Night Trains, Three Songs for Working Slowly, Last Light on the Ridge, and Summer Porch Sessions. Sample entries are labeled as placeholders.

## Technology

- Vite
- React
- TypeScript
- Plain CSS

There is no database, account system, analytics package, paid service, or runtime server. Navigation uses URL hashes, which keeps every page directly linkable on static hosts such as GitHub Pages without needing a redirect workaround.

## Run locally

You need a current LTS version of [Node.js](https://nodejs.org/).

This project keeps a `pnpm` lockfile for repeatable builds. Install [pnpm](https://pnpm.io/installation), then run:

```bash
pnpm install
pnpm dev
```

If you prefer npm, `npm install` and `npm run dev` work too.

Vite will print a local URL, usually `http://localhost:5173/`. Open that address in a browser.

Useful commands:

```bash
pnpm typecheck  # Check TypeScript without creating output
pnpm build      # Type-check and create the production site in dist/
pnpm preview    # Preview the production build locally
```

## Add content

All room definitions and sample entries live in [`src/content.ts`](src/content.ts). Add an item to a room's `entries` array and the shared card layout will render it automatically.

The main reusable pieces are:

- `src/components/SiteHeader.tsx` — shared navigation
- `src/components/RoomGlyph.tsx` — room-specific visual marks
- `src/pages/RoomPage.tsx` — one modular template used by all four rooms
- `src/styles.css` — the complete visual system and responsive rules

For a playable entry, add its page route to `App.tsx` and set the entry's `playPath` in `src/content.ts`. The room card will show a play link in place of its placeholder note.

The Listening Room groups tracks from all four recordings on one page. The player loops checked tracks and stays mounted while you browse. The music ships as static MP3s, including individual tracks and full-recording downloads. The `scripts/render-*.py` files regenerate them with Python, NumPy, and lameenc.

**Last Light on the Ridge** uses mandolin recordings by Philharmonia musicians. The melody uses soft plucks, with individual strokes from stronger tremolos blended into some attacks. Two recorded tremolos play at the bridge cadences. Guitar and bass use the existing synthesized backing. The [Philharmonia sound sample license](https://philharmonia.co.uk/resources/sound-samples/) permits distribution in finished music. Keep the source archive outside the repository.

To regenerate the MP3, download **Strings.zip** from the [Philharmonia sound samples page](https://philharmonia.co.uk/resources/sound-samples/). With Python 3.11 or later, run:

```powershell
python -m pip install numpy lameenc miniaudio==1.70
python scripts/render-last-light-on-the-ridge.py "C:\path\to\Strings.zip"
```

The renderer also accepts the smaller `Strings/mandolin/mandolin.zip` from inside that archive. These tools are only needed to regenerate the recording. Vite and GitHub Pages serve the finished MP3 as a static file.

## Publish later with GitHub Pages

The repository includes `.github/workflows/deploy.yml`, a GitHub Actions workflow that builds and publishes `dist/` whenever the `main` branch is updated.

1. Create a new public GitHub repository. GitHub Pages is free for public repositories.
2. Commit this project and push it to the repository's `main` branch.
3. On GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions** as the source.
5. Open the **Actions** tab and allow the included “Deploy to GitHub Pages” workflow to finish.
6. GitHub will show the public site address in the Pages settings and in the completed workflow.

`vite.config.ts` uses `base: './'`, so the built assets work whether the site is hosted at `username.github.io` or inside a repository path such as `username.github.io/my-playground/`.

## Design notes

The visual language is intentionally restrained: warm paper, dark ink, editorial serif type, fine rules, and quiet motion. It uses system fonts and CSS-drawn motifs, so there are no font downloads or image dependencies. Motion respects the operating system's reduced-motion preference.

## Status

Open the Arcade to play **Pocket Weather**, **Orbital Orchard**, or **Ledger Runner** locally.
