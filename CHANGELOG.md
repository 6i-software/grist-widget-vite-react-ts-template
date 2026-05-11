Changelog
=========

All notable changes to this project will be documented in this file.

---

## Version 0.1.0 &mdash; 2026.05.11

### Added

- Initial release of the **Grist Widget Vite + React + TypeScript** boilerplate template.
- `dev` script (`tools/dev.js`) — starts a Vite.js dev server (HMR enabled) on port `5173` alongside a Grist-core Docker instance on port `8484`.
- `build` script (`tools/build.js`) — production build via Vite.js with configurable build strategies; outputs versioned artefacts to `/dist/v{version}` and updates the Grist manifest automatically.
- `preview` script (`tools/preview.js`) — builds the widget in production mode, starts a Vite preview server on port `4173`, then launches Grist via Docker pointing to the preview manifest.
- Docker Compose setup (`docker-compose.yml`) — runs `gristlabs/grist:1.7` with `host.docker.internal` networking and a persistent volume (`grist_data`).
- `grist-up` / `grist-down` / `grist-logs` node.js scripts for Docker Grist-core lifecycle management.
- `GRIST_WIDGET_LIST_URL` environment variable forwarding from the Node.js scripts to the Docker container for Grist local manifest URL.
- Build strategy resolution utilities (`tools/console/build-strategy.js`).
- Rich ANSI console output helpers (`tools/console/helper.js`, `tools/console/ansi.js`) with coloured splash screens, section headers, and server info display.
- Verbose mode support via the `isVerbose` flag — pipes child process stdio when enabled (`-v`, `--verbose`)
- Graceful shutdown handlers (`SIGINT` / `SIGTERM`) in both `dev` and `preview` scripts, cleanly closing Vite servers and stopping Docker containers.
- `gristWidget` metadata block in `package.json` (`name`, `url`, `widgetId`, `accessLevel`, `renderAfterReady`, `authors`, …).
- Vite 8 ecosystem with React 19, TypeScript ~6, and ESLint 10 as core dependencies.
  - `vite-plugin-singlefile` for single-file bundle output support.
  - `@rolldown/plugin-babel` + `babel-plugin-react-compiler` integration for experimental React Compiler support.
  - ESLint configuration with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`.
