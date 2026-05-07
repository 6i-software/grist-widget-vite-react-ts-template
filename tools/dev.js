import {spawn, spawnSync} from 'node:child_process';
import {showSection, showSplashscreen, showDevServerInfo, log, isVerbose, checkGristWidgetConfig} from "./console/helper.js";
import {createServer} from 'vite';
import {ANSI} from "./console/ansi.js";
import pkg from '../package.json' with {type: 'json'};

const COLOR_PRIMARY = ANSI.FG_DEEP_ORANGE;
const ABORT_CONTROLER = new AbortController();

async function main() {
    showSplashscreen({
        title: "GRIST WIDGET • RUNNING DEV",
        colorPrimary: COLOR_PRIMARY,
        width: 60,
        newlineAfter: true,
    });

    checkGristWidgetConfig(pkg);

    // Start vite.js server
    let viteServer;
    showSection("Launching Vite.js server (HMR enabled)", {newlineBefore: false});
    try {
        viteServer = await createServer({
            server: {
                host: true,
                port: 5173,
                strictPort: true
            }
        });
        await viteServer.listen();
        log(`${ANSI.FG_BRIGHT_BLACK}[vite]${ANSI.RESET} ${ANSI.FG_GREEN}✓${ANSI.RESET} Vite web server local is available at ${ANSI.FG_CYAN}http://localhost:${ANSI.FG_BRIGHT_CYAN}5173${ANSI.RESET}${ANSI.FG_CYAN}/${ANSI.RESET}`);
        log(`${ANSI.FG_BRIGHT_BLACK}[vite]${ANSI.RESET} ${ANSI.FG_GREEN}✓${ANSI.RESET} Grist manifest is available at ${ANSI.FG_CYAN}http://localhost:${ANSI.FG_BRIGHT_CYAN}5173${ANSI.RESET}${ANSI.FG_CYAN}/manifest.json${ANSI.RESET}\n`);
    } catch (error) {
        console.error(`${ANSI.FG_BRIGHT_BLACK}[vite]${ANSI.RESET} ${ANSI.FG_RED}✗ Error: Unable to create vite web server.`, error, `${ANSI.RESET}\n`);
        process.exit(1);
    }

    // Start Grist instance (with Docker compose)
    showSection("Launching Grist (Docker)",{newlineBefore: false});
    const widgetManifestUrl = "http://host.docker.internal:5173/manifest.json";
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
            console.error(`${ANSI.FG_BRIGHT_BLACK}[grist-docker]${ANSI.RESET} ${ANSI.FG_RED}✗ Error: Unable to start Grist-core Docker container. Please ensure that Docker engine is running!`, `${ANSI.RESET}\n`);
            if (viteServer) viteServer.close();
            return;
        }

        if(isVerbose) console.log();

        showSection("Grist DEV environment is ready",{newlineBefore: false});
        showDevServerInfo(5173, 8484);
        if (viteServer) {
            console.log();
            viteServer.bindCLIShortcuts({print: true});
            console.log();
        }
    });

    const cleanup = async () => {
        if(isVerbose) console.log();
        showSection("Shutting down...", {newlineBefore: false, newlineAfter: false});
        ABORT_CONTROLER.abort();

        if (viteServer) {
            await viteServer.close();
        }

        spawnSync('pnpm', ['grist-down'], {stdio: 'inherit', shell: true});
        console.log(`\nGoodbye!\n`);
        process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}

main().catch(err => {
    if (err.name === 'AbortError') return;
    console.error(err);
    process.exit(1);
});