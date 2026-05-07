import {ANSI} from './ansi.js';
import os from 'node:os';

const COLOR_PRIMARY = ANSI.FG_DEEP_ORANGE;

export const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');

export const log = (...args) => {
    if (isVerbose) {
        console.log(...args);
    }
};

export const showSplashscreen = (options = {}) => {
    const {
        title = "GRIST-WIDGET",
        colorPrimary = COLOR_PRIMARY,
        width = 60,
        clearConsole = false,
        newlineBefore = true,
        newlineAfter = false,
    } = options;

    const line = '─'.repeat(width);
    const colorBorder = colorPrimary;
    const colorText = colorPrimary + ANSI.BOLD;
    const colorArrow = ANSI.FG_RGB(100,100,100);
    const spaces = width - title.length;
    const padLeft = Math.floor(spaces / 2);
    const padRight = spaces - padLeft;
    const centeredTitle = ' '.repeat(padLeft) + colorText + title + ANSI.RESET + ' '.repeat(padRight);

    if(clearConsole) {
        console.clear();
    }
    if(newlineBefore) console.log();
    [
        `${colorBorder}┌${line}┐${ANSI.RESET}`,
        `${colorBorder}│${ANSI.RESET}${' '.repeat(width)}${colorBorder}│${ANSI.RESET}`,
        `${colorBorder}│${centeredTitle}${colorBorder}│${ANSI.RESET}`,
        `${colorBorder}│${ANSI.RESET}${' '.repeat(width)}${colorBorder}│${ANSI.RESET}`,
        `${colorBorder}└${line}┘${ANSI.RESET}`,
    ].forEach(line => console.log(line));
    if (isVerbose) {
        [
            ``,
            `${colorText}Environment setup${ANSI.RESET}`,
            `  ${colorArrow}➜${ANSI.RESET}  Vite.js v8.0.10`,
            `  ${colorArrow}➜${ANSI.RESET}  React v19.2 (TypeScript)`,
            `  ${colorArrow}➜${ANSI.RESET}  Grist-core v1.7 (Docker image)`,
        ].forEach(line => console.log(line));
    }
    if(newlineAfter) console.log();
};

export const showSection = (message, options = {}) => {
    const {
        prefix = ">>",
        suffix = "<<",
        colorPrimary = COLOR_PRIMARY,
        stylePrefix = colorPrimary + ANSI.BOLD,
        styleText = ANSI.FG_WHITE,
        styleBorder = colorPrimary,
        newlineBefore = true,
        newlineAfter = true,
    } = options;

    const lineChar = '─';
    const fullMessage = `${prefix} ${message} ${suffix}`;
    const border = lineChar.repeat(fullMessage.length);

    if (newlineBefore) console.log();
    log(`${styleBorder}${border}${ANSI.RESET}`);
    console.log(`${stylePrefix}${prefix}${ANSI.RESET}${styleText} ${message} ${ANSI.RESET}${stylePrefix}${suffix}${ANSI.RESET}`);
    log(`${styleBorder}${border}${ANSI.RESET}`);
    if (newlineAfter) console.log();
};

export const showDevServerInfo = (options= {}) => {
    const {
        vitePort = 5173,
        gristPort = 8484,
    } = options;

    const getNetworkIps = () => {
        const interfaces = os.networkInterfaces();
        const addresses = [];
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                // On ne garde que l'IPv4 et on ignore le localhost (127.0.0.1)
                if (iface.family === 'IPv4' && !iface.internal) {
                    addresses.push(iface.address);
                }
            }
        }
        return addresses;
    };

    const networkIps = getNetworkIps();
    const arrow = `${ANSI.FG_RGB(100,100,100)}➜${ANSI.RESET}`;
    console.log(`  ${arrow}  ${ANSI.BOLD}Vite local:${ANSI.RESET}   ${ANSI.FG_CYAN}http://localhost:${ANSI.FG_BRIGHT_CYAN}${vitePort}${ANSI.RESET}${ANSI.FG_CYAN}/${ANSI.RESET}`);
    networkIps.forEach(ip => {
        console.log(`  ${arrow}  ${ANSI.BOLD}Vite network:${ANSI.RESET} ${ANSI.FG_CYAN}http://${ip}:${ANSI.FG_BRIGHT_CYAN}${vitePort}${ANSI.RESET}${ANSI.FG_CYAN}/${ANSI.RESET}`);
    });
    console.log(`  ${arrow}  ${ANSI.BOLD}Grist manifest widgets:${ANSI.RESET} ${ANSI.FG_CYAN}http://localhost:${ANSI.FG_BRIGHT_CYAN}${vitePort}${ANSI.RESET}${ANSI.FG_CYAN}/manifest.json${ANSI.RESET}`);
    console.log(`  ${arrow}  ${ANSI.BOLD}Grist instance local:${ANSI.RESET}   ${ANSI.FG_CYAN}http://localhost:${ANSI.FG_BRIGHT_CYAN}${gristPort}${ANSI.RESET}${ANSI.FG_CYAN}/${ANSI.RESET}`);
}

export const checkGristWidgetConfig = (pkg) => {
    if (!pkg.gristWidget) {
        console.error(`${ANSI.FG_RED}✗ Error: gristWidget field configuration is missing into package.json`, `${ANSI.RESET}\n`);
        process.exit(1);
    } else {
        const errors = [];
        const { gristWidget: gw } = pkg;
        if (!gw.name) errors.push("Missing 'gristWidget.name' property");
        if (!gw.url) errors.push("Missing 'gristWidget.url' property");
        if (!gw.widgetId) errors.push("Missing 'gristWidget.widgetId' property");
        if (!gw.description) errors.push("Missing 'gristWidget.description' property");

        if (errors.length > 0) {
            console.error(`${ANSI.FG_RED}✗ Error: Bad configuration gristWidget field into package.json:${ANSI.RESET}`);
            errors.forEach(err => {
                console.error(`${ANSI.FG_RED}  • ${err}${ANSI.RESET}`);
            });
            console.log();
            process.exit(1);
        }
    }
}