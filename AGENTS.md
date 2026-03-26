# Agents

## Cursor Cloud specific instructions

### Project overview

Kondor is a Chrome browser extension (Manifest V3) wallet for the Koinos Blockchain, built with Vue 2 and TypeScript. It is a single-package project (not a monorepo). See `README.md` for full details.

### Critical: Node.js OpenSSL compatibility

This project uses Webpack 4 and Vue CLI 4, which rely on legacy OpenSSL hash functions. Build/dev/lint scripts now run through `scripts/run-with-openssl-legacy.js`, which automatically injects `--openssl-legacy-provider` on Node.js 17+ (including Node 18/20/22). Manual `NODE_OPTIONS` export is not required.

### Development workflow (SPA / test mode)

The wallet can be developed as a single-page application with hot reload. The `.env` file must contain `VUE_APP_ENV=test` (already created during setup). In test mode, browser-extension storage is bypassed and data is kept in memory. The test password is `a`.

1. `yarn build:ts` — compile the TypeScript library (`src/ts/` → `lib/`)
2. `node ./server.js` — start the CORS proxy / static server on port 8081 (optional; needed for blockchain API calls)
3. `yarn serve` — start the Vue dev server on port 8080

### Commands reference

| Task | Command |
|------|---------|
| Install deps | `yarn install` |
| Lint | `yarn lint` (or `yarn lint --no-fix` to check without auto-fixing) |
| Build TS lib | `yarn build:ts` |
| Dev server | `yarn serve` (port 8080) |
| Full build | `yarn build` (produces `dist/` for Chrome extension) |
| CORS proxy | `node ./server.js` (port 8081) |

### Gotchas

- `yarn build:ts` must be run before `yarn serve` or `yarn build`; the Vue app imports compiled JS from `lib/`.
- There are no automated test suites in this project (no `test` script in `package.json`).
- The `.env` file is gitignored. If it is missing, create it with `VUE_APP_ENV=test` and `ESLINT_NO_DEV_ERRORS=true`.
- Lint produces warnings (unused variables in `tokenPriceService.js`) but no errors; this is expected.
