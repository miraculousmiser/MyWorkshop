# The Workshop — version 0.1

A static personal website and long-term creative playground for browser games, economic philosophy, books, music, and interactive experiments.

Version 0.1 establishes five pages:

- Home
- Arcade
- Library
- Listening Room
- Laboratory

All entries currently shown in the four rooms are visibly marked as placeholder content.

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

When real content replaces a sample, remove or adapt the `Placeholder` label in `RoomPage.tsx`.

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

Version 0.1 is a foundation rather than a finished collection. The most natural next step is to replace one placeholder with one small, complete thing.
