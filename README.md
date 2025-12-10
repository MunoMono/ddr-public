# DDR Public Preview

Public-facing shell for the Department of Design Research (DDR). The app mirrors the internal IA so collaborators can explore the structure, typography, and API sandbox without exposing private datasets.

## Live site

- **GitHub Pages:** https://munomono.github.io/ddr-public/
- Deploys are triggered whenever `main` is updated. The Vite config already sets `base: "/ddr-public/"` so asset paths resolve correctly on Pages.

## Stack

- React 19 + React Router
- Vite + SWC (fast local dev + builds)
- Carbon Design System (`@carbon/react`, tokens, and layout primitives)
- Monaco editor + GraphQL sandbox presets

## Getting started

```bash
npm install
npm run dev        # start local dev server
npm run lint       # run ESLint (React hooks + recommended rules)
npm run build      # production build to dist/
npm run preview    # preview the production bundle
```

The dev server proxies `/graphql` to the local backend (localhost:8000) during development. In production, the app connects to `https://ddrarchive.org/graphql`.

## Deploying to GitHub Pages

1. Run `npm run build` to generate the production bundle in `dist/`.
2. Commit the new build artifacts if you are using a static `gh-pages` branch, or let a GitHub Action publish `dist/` (recommended).
3. Ensure the repository’s Pages settings target the `gh-pages` branch (or `/docs` folder) that your workflow populates.
4. Push to `main` — once the GitHub Pages workflow finishes, the site refreshes at https://munomono.github.io/ddr-public/.

Because the project uses the `base` option, no extra rewrites are needed; just make sure the published files sit at the repo root on the `gh-pages` branch.
