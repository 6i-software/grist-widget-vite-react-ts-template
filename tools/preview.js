import {spawn, spawnSync} from 'node:child_process';
import {showSection, showSplashscreen, showDevServerInfo, log, isVerbose, checkGristWidgetConfig} from "./console/helper.js";
import {preview} from 'vite';
import {ANSI} from "./console/ansi.js";
import pkg from '../package.json' with {type: 'json'};
import {getBuildStrategyLabel, resolveBuildStrategy} from "./console/build-strategy.js";

const COLOR_PRIMARY = ANSI.FG_CYAN;
const PREVIEW_PORT = 4173;
const GRIST_PORT = 8484;

async function main() {
    showSplashscreen({
        title: "GRIST WIDGET • BUILD & PREVIEW",
        colorPrimary: COLOR_PRIMARY,
        width: 60,
        newlineAfter: true,
    });

    checkGristWidgetConfig(pkg);

    const buildStrategy = resolveBuildStrategy();
    const buildStrategyLabel = getBuildStrategyLabel(buildStrategy);
    showSection(`Building app with Vite.js - strategy ${buildStrategyLabel}`, {colorPrimary: COLOR_PRIMARY, newlineBefore: false});
    log(`${ANSI.FG_BRIGHT_BLACK}[vite-build]${ANSI.RESET} Grist widget version: ${ANSI.FG_CYAN}${pkg.version}${ANSI.RESET}`);
    log(`${ANSI.FG_BRIGHT_BLACK}[vite-build]${ANSI.RESET} Node environment: ${ANSI.FG_CYAN}production${ANSI.RESET}`);
    log(`${ANSI.FG_BRIGHT_BLACK}[vite-build]${ANSI.RESET} Preview mode: ${ANSI.FG_CYAN}enabled${ANSI.RESET}`);

    const viteBuild = spawnSync('pnpm', ['vite-build'], {
        stdio: isVerbose ? 'inherit' : 'ignore',
        shell: true,
        env: {
            ...process.env,
            PREVIEW_MODE: 'true',
            NODE_ENV: 'production',
            VITE_BUILD_STRATEGY: buildStrategy
        }
    });
    if (viteBuild.status !== 0) {
        console.error(`${COLOR_PRIMARY}[vite-build]${ANSI.RESET} ${ANSI.FG_RED}✗ Error: Build failed with exit code ${viteBuild.status}.`, `${ANSI.RESET}\n`);
        process.exit(1);
    }

    log('');
    showSection(`Launching Vite.js server (Preview)`, {colorPrimary: COLOR_PRIMARY, newlineBefore: false});
    let previewServer;
    try {
        previewServer = await preview({
            preview: {
                port: PREVIEW_PORT,
                strictPort: true,
                host: true
            }
        });
        log(`${ANSI.FG_BRIGHT_BLACK}[vite-preview]${ANSI.RESET} ${ANSI.FG_GREEN}✓${ANSI.RESET} Vite preview web server local is available at ${ANSI.FG_CYAN}http://localhost:${ANSI.FG_BRIGHT_CYAN}4173${ANSI.RESET}${ANSI.FG_CYAN}/${ANSI.RESET}`);
        log(`${ANSI.FG_BRIGHT_BLACK}[vite-preview]${ANSI.RESET} ${ANSI.FG_GREEN}✓${ANSI.RESET} Grist manifest is available at ${ANSI.FG_CYAN}http://localhost:${ANSI.FG_BRIGHT_CYAN}5173${ANSI.RESET}${ANSI.FG_CYAN}/manifest.json${ANSI.RESET}\n`);
    } catch (error) {
        console.error(`${ANSI.FG_BRIGHT_BLACK}[vite-preview]${ANSI.RESET} ${ANSI.FG_RED}✗ Error: Unable to start preview server.`, error, `${ANSI.RESET}\n`);
        process.exit(1);
    }


    showSection("Launching Grist in preview mode (Docker)", {colorPrimary: COLOR_PRIMARY, newlineBefore: false});
    const widgetManifestUrl = `http://host.docker.internal:${PREVIEW_PORT}/manifest.json`;
    const grist = spawn('pnpm', ['grist-up'], {
        stdio: isVerbose ? 'inherit' : 'ignore',
        shell: true,
        env: {
            ...process.env,
            GRIST_WIDGET_LIST_URL: widgetManifestUrl
        }
    });
    if(isVerbose) {
        console.log(`${ANSI.FG_BRIGHT_BLACK}[grist-docker]${ANSI.RESET} Grist instance will be available at ${ANSI.FG_CYAN}http://localhost:8484/${ANSI.RESET}`);
        console.log(`${ANSI.FG_BRIGHT_BLACK}[grist-docker]${ANSI.RESET} Linking Grist to manifest with GRIST_WIDGET_LIST_URL: ${ANSI.FG_CYAN}${widgetManifestUrl}${ANSI.RESET}`);
    }

    grist.on('close', (code) => {
        if (code !== 0) {
            console.error(`${ANSI.FG_BRIGHT_BLACK}[grist-docker]${ANSI.RESET} ${ANSI.FG_RED}✗ Error: Unable to start Grist-core Docker container for preview. Please ensure that Docker engine is running!`, `${ANSI.RESET}\n`);
            if (previewServer) previewServer.httpServer.close();
            return;
        }

        log();

        showSection(`Grist PREVIEW environment is ready`, {colorPrimary: COLOR_PRIMARY, newlineBefore: false});
        showDevServerInfo({vitePort: PREVIEW_PORT, gristPort: GRIST_PORT});
        if (previewServer) {
            console.log();
            previewServer.bindCLIShortcuts({print: true});
            console.log();
        }
    });

    // Cleanup
    const cleanup = async () => {
        log();
        showSection("Shutting down preview...", {colorPrimary: COLOR_PRIMARY, newlineBefore: false, newlineAfter: false});

        if (previewServer) {
            await previewServer.httpServer.close();
        }

        spawnSync('pnpm', ['grist-down'], {stdio: 'inherit', shell: true});
        console.log(`\nGoodbye!\n`);
        process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});