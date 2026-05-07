import {spawnSync} from 'node:child_process';
import {showSection, showSplashscreen, log, isVerbose, checkGristWidgetConfig} from "./console/helper.js";
import {ANSI} from "./console/ansi.js";
import pkg from '../package.json' with {type: 'json'};
import {getBuildStrategyLabel, resolveBuildStrategy} from "./console/build-strategy.js";

const COLOR_PRIMARY = ANSI.FG_ELECTRIC_VIOLET;

async function main() {
    showSplashscreen({
        title: "GRIST WIDGET • PRODUCTION BUILD",
        colorPrimary: COLOR_PRIMARY,
        width: 60,
        newlineAfter: true,
    });

    checkGristWidgetConfig(pkg);

    const buildStrategy = resolveBuildStrategy();
    const buildStrategyLabel = getBuildStrategyLabel(buildStrategy);
    showSection(`Building app with Vite.js - strategy ${buildStrategyLabel}`, {colorPrimary: COLOR_PRIMARY, newlineBefore: false});
    log(`${ANSI.FG_BRIGHT_BLACK}[vite-build]${ANSI.RESET} Grist widget version: ${ANSI.FG_CYAN}${pkg.version}${ANSI.RESET}`);
    log(`${ANSI.FG_BRIGHT_BLACK}[vite-build]${ANSI.RESET} Grist widget name: ${ANSI.FG_CYAN}${pkg.gristWidget.name}${ANSI.RESET}`);
    log(`${ANSI.FG_BRIGHT_BLACK}[vite-build]${ANSI.RESET} Node environment: ${ANSI.FG_CYAN}production${ANSI.RESET}`);
    const viteBuild = spawnSync('pnpm', ['vite-build'], {
        stdio: isVerbose ? 'inherit' : 'ignore',
        shell: true,
        env: {
            ...process.env,
            NODE_ENV: 'production',
            VITE_BUILD_STRATEGY: buildStrategy
        }
    });
    if (viteBuild.status !== 0) {
        console.error(`${COLOR_PRIMARY}[vite-build]${ANSI.RESET} ${ANSI.FG_RED}✗ Error: Build failed with exit code ${viteBuild.status}.`, `${ANSI.RESET}\n`);
        process.exit(1);
    }

    log('');
    showSection(`Manifest & output`, {colorPrimary: COLOR_PRIMARY, newlineBefore: false});
    const outputPath = `/dist/v${pkg.version}`;
    console.log(`${ANSI.FG_GREEN}✓${ANSI.RESET} Production files successfully generated in ${ANSI.FG_CYAN}${outputPath}${ANSI.RESET}`);
    console.log(`${ANSI.FG_GREEN}✓${ANSI.RESET} Grist manifest successfully updated to version ${ANSI.FG_BRIGHT_CYAN}${pkg.version}${ANSI.RESET}\n`);
    log(`${ANSI.FG_GREEN}Grist widget ready for deployment!${ANSI.RESET}\n`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});