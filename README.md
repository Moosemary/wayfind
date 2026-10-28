# Wayfind

Minimal route planner. Pick a start and a destination by searching or clicking the map, and Wayfind draws the driving route.

Built with Vite, vanilla JavaScript, Mapbox GL JS, and the Mapbox Geocoding and Directions APIs.

## Develop

```bash
npm install
cp .env.example .env.local   # then paste your public Mapbox token (pk.…)
npm run dev
```

`.env.local` is git-ignored. The token is read from `VITE_MAPBOX_TOKEN`.

## Deploy

Pushing to `main` builds and publishes to GitHub Pages via GitHub Actions. Add the token as a repository secret named `VITE_MAPBOX_TOKEN`. Restrict the token to the site URL in your Mapbox account.
