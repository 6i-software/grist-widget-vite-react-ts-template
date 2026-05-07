Grist widget Vite React TypeScript template
===========================================
<small>[**Français**](./README.fr.md) | *English*</small>

Vite-based React and TypeScript boilerplate for creating Grist custom widgets.

---

## Preamble

This boilerplate provides a robust foundation for building Grist custom widgets. By leveraging **Vite.js** for near-instant Hot Module Replacement (HMR) and **TypeScript** for end-to-end type safety, it ensures a superior developer experience. It also includes a **dockerized Grist environment**, allowing you to test widgets in a real Grist instance locally with zero manual setup. The architecture is highly flexible: it automatically manages your widget manifest and supports two build strategies (Standard vite for optimized assets spliting or SPA (single page application)) for your deployment needs.

**Main features:**
- Provide a ready‑to‑use environment for Grist custom widget developers
- Simplify local development, building, and previewing through dedicated scripts ( `dev`, `build` and `preview`).
- Enable easy customization via the `grist` field in `package.json`.


## Quick Start


### Prerequisites

- **[Docker](https://docs.docker.com/get-docker/)** (>= 28.4)
- **[Docker Compose](https://docs.docker.com/compose/install/)** (>= 2.39)
- **[Node.js](https://nodejs.org/en/download/)** (>= 20.20.x)
- **[pnpm](https://pnpm.io/installation)** (>= 10.28.x)


### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/AOT-DEP-BADI/grist-widget-vite-react-ts-template.git
   ```


2. **Install dependencies** using the [pnpm](https://pnpm.io/installation) package manager:
   ```bash
   pnpm install
   ```


3. **Configure your widget** by editing the `grist` field in the root `package.json`. This makes the widget available in your custom Grist widget catalog.
   ```json
   /** ./package.json **/
   {
     "name": "@badi/grist-widget-title",
     "version": "0.0.1",
     "description": "A Grist widget for ...",
     // ... //
     "gristWidget": {
       "name": "Title widget (dev)",
       "url": "http://localhost:5173/index.html",
       "widgetId": "@badi/grist-widget-title",
       "published": true,
       "accessLevel": "none",
       "renderAfterReady": true,
       "description": "Lorem ipsum dolor sit amet.",
       "isGristLabsMaintained": false,
       "authors": [{"name": "v20100v", "url": "https://github.com/v20100v"}]
     }
   }
   ```


4. **Start the local Grist development environment**
   ```bash
   pnpm dev
   ```
   > **Tip**: For more detailed output during startup, you can use the `--verbose` or `-v` flag in command `pnpm dev --verbose`. This is helpful for troubleshooting container orchestration or server initialization.   

   This command launches a Grist Docker container at <http://localhost:8484> and a Vite dev server at <http://localhost:5173>, which also serves the widget manifest at <http://localhost:5173/manifest.json>.

    ![Launch Grist custom widget development environment with pnpm dev command](doc/assets/grist-widget-vite-react-ts-template__pnpm-dev.png)
    <small>— Launch Grist custom widget development environment</small>

    > **Tip:** To separate vite logs and docker log, open two terminals and run:
    > - Terminal 1: `pnpm grist-up ; pnpm grist-logs`
    > - Terminal 2: `pnpm vite --debug`


5. **Check local manifest availability**. Ensure your widget is correctly exposed by checking the dynamically generated manifest.json at <http://localhost:5173/manifest.json>.


6. **Use the widget into local Grist**. Once the dev environment is running, open the local Grist instance at <http://localhost:8484> in order to create a new document and add into a custom view. 

   ![Load widget in local Grist instance](doc/assets/grist-widget-vite-react-ts-template__load-widget-in-Grist-instance.png)
   <small>— Local widget load into Grist instance local</small>

    > **Note:** You will notice that the local widget declared in the manifest.json (served at `:5173`) is accessible. It appears automatically because the `GRIST_WIDGET_LIST_URL` docker environment variable is configured to point Grist toward your local manifest.


7. And there’s the final widget! Thanks to HMR (Hot Module Replacement) provides by Vite.js, your code changes are reflected instantly without a full page refresh. Unlike standard Live Reload, HMR updates only the modified modules. This preserves your widget’s current state and data, ensuring a seamless and lightning-fast development workflow.

    ![Real-time Widget Rendering in Grist with HMR](doc/assets/grist-widget-vite-react-ts-template__result-react-widget-in-Grist.png)
   <small>— Real-time Widget Rendering in Grist with HMR</small>



### Build

The build process compiles your TypeScript source code and assets into a production-ready widget, optimizing for both performance and compatibility. It leverages Vite.js for asset bundling and the React Compiler for optimized rendering. The final artifacts are organized within the `dist/` folder, ready for deployment.

```bash
pnpm build
```

#### Build Strategies

This tool supports two distinct architectural strategies. You can toggle between them using CLI flags or the `VITE_BUILD_STRATEGY` environment variable.

| Strategy     | Command                 | Description                                                                                                                                                                         |
|:-------------|:------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Standard** | `pnpm build --standard` | **Default.** Implements advanced code-splitting. Third-party libraries (like React) are bundled into separate `vendor` chunks to maximize browser cache hits and reduce load times. |
| **SPA**      | `pnpm build --spa`      | To build a SPA (*Single Page Application*). It Utilizes `vite-plugin-singlefile` to inline all Javascript and CSS directly into a **single HTML file**.                             |

To determine which strategy to use, the `build.js` tools follows this hierarchy:

1. **CLI Shorthand flags** (e.g., `--spa` or `--standard`)
2. **Explicit CLI arguments** (e.g., `--VITE_BUILD_STRATEGY=SPA`)
3. **Environment variables** (via `.env` or system shell)
4. **Use the default fallback** (`STANDARD`)

#### Build pipeline

When you trigger a build, the following lifecycle events occur:
- **Manifest Generation**: The `generateGristManifestPlugin` extracts your `grist` configuration from `package.json` to create a standard Grist `manifest.json` in the public directory[cite: 5].
- **Versioned Output**: To prevent deployment conflicts, assets are placed in a versioned subdirectory based on the widget version, such as `dist/v1.0.0/`.
- **Metadata post-processing**: Once the bundle is closed, the `updateGristManifestDistPlugin` injects the current version, and a `lastUpdatedAt` ISO timestamp.



### Preview

Preview mode allows you to test the production-ready version of your widget (the compiled files in `/dist`) within a live Grist instance before deployment.

```bash
pnpm preview
```

This command orchestrates four key stages:

- **Production build**: Automatically triggers a build using `NODE_ENV: production` and `PREVIEW_MODE: true` environment variables to ensure your assets are compiled specifically for the preview environment.

- **Vite preview server**: Starts a local web server on port 4173 (in strict mode) to serve the static files directly from the `dist/v.{x.y.z}/` directory.

- **Dockerized Grist**: Launches a Grist container pre-configured to automatically recognize the production manifest stores in `dist/v.{x.y.z}/manifest.json`

- **Dynamic Linking**: Injects the production manifest URL ([http://host.docker.internal:4173/manifest.json](http://host.docker.internal:4173/manifest.json)) into the Grist environment via the `GRIST_WIDGET_LIST_URL` variable, making your widget instantly available in the Grist custom widget catalog.


## About

### Want to contribute ?

Ideas, bug reports, reports a typo in documentation, comments, pull-request & Github stars are always welcome !


### License

Release under [MIT License](./LICENSE),<br/>
Copyright (c) 2026 by 2o1oo vb20100bv@gmail.com