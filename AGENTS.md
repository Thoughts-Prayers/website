# Repository Guidelines

## Project Structure & Module Organization
- Root entry is `index.html`; shared static assets, favicons, manifests, and `_headers` live beside it in `assets/`, `site.webmanifest`, and `sitemap.xml`.
- `our-daily-bread/` contains the puzzle: `src/` modular ES2015 JS (`config.js`, `main.js`, puzzle engine, UI), `styles/` compiled CSS, `assets/` imagery and share graphics.
- Adjust puzzle settings in `our-daily-bread/src/config.js` and bump `BUILD_VERSION` in `our-daily-bread/src/main.js` whenever JS or image payloads change.

## Build, Test, and Development Commands
- `python3 -m http.server 8080` (repo root) serves the whole site at `http://localhost:8080` for routing, asset, and puzzle checks.
- Run the same command from `our-daily-bread/` to iterate on puzzle-only paths while keeping relative URLs intact.
- Static preview via direct `index.html` opening is fine for copy, but rely on a server when testing caching, share sheet, or service-worker cleanup.

## Coding Style & Naming Conventions
- JavaScript uses 2-space indentation, semicolons, named exports, `const`/`let`, `camelCase` functions, and `UPPER_SNAKE_CASE` configuration constants.
- DOM IDs and CSS classes stay lowercase-hyphen; extend styling through the CSS custom properties defined in `our-daily-bread/styles/main.css`.
- Name puzzle images sequentially (`01.jpg`, `02.jpg`, …) or list them in `IMAGES`; avoid renaming directories so cache busting stays reliable.

## Testing Guidelines
- On a local server, load a fresh puzzle, solve it on each difficulty, and watch move counts, share button state, and habit CTA visibility.
- After bumping `BUILD_VERSION`, clear localStorage and caches to verify stale assets are purged.
- Smoke-test the landing page for broken links, font loads, and manifest/meta tags since it deploys with the puzzle.

## Commit & Pull Request Guidelines
- Match history: concise Title Case subjects under ~60 characters (`Added footer`, `UI bug fixes`) with optional body details for context.
- PRs should link issues, include before/after screenshots for UI tweaks, and list asset or configuration updates.
- Explicitly flag changes to `BUILD_VERSION`, manifests, or `_headers` so reviewers can coordinate deploy timing.

## Deployment & Caching Checks
- Static hosting depends on the Netlify-style rules in `_headers`; update them when adding asset directories or moving JS bundles so max-age directives stay correct.
- Share images and manifest icons are cached for a year; when replacing them, change filenames or append `?v=` tokens, then confirm the new URLs in social or manifest previews.
