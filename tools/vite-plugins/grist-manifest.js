import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {ANSI} from '../console/ansi.js';
import {checkGristWidgetConfig, log} from "../console/helper.js";

// Resolve __dirname for ES modules environment
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Fetch the widget configuration based on the attribute gristWidget in package.json .
 *
 * @param {Object} pkg - The package.json content.
 * @returns {Array} An array containing the formatted manifest object.
 */
const _getGristWidgetConfig = (pkg) => {
    checkGristWidgetConfig(pkg);

    const { gristWidget: gw } = pkg;
    return [{
        name: gw.name,
        url: gw.url,
        widgetId: gw.widgetId,
        published: gw.published ?? true,
        accessLevel: gw.accessLevel ?? 'none',
        renderAfterReady: gw.renderAfterReady ?? true,
        description: gw.description,
        isGristLabsMaintained: gw.isGristLabsMaintained ?? false,
        authors: gw.authors || []
    }];
};

/**
 * Vite plugin to generate the initial manifest.json in the public directory.
 * Runs at the start of the build process.
 */
export const generateGristManifestPlugin = (pkg) => ({
    name: 'generate-grist-manifest',
    buildStart() {
        try {
            const publicDir = path.resolve(__dirname, '../../public');
            const manifestPath = path.join(publicDir, 'manifest.json');

            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }

            // Create and write the manifest file
            const config = _getGristWidgetConfig(pkg);
            fs.writeFileSync(manifestPath, JSON.stringify(config, null, 2));

            const msg = `${ANSI.FG_BRIGHT_BLACK}[vite][plugin generate-grist-manifest]${ANSI.RESET} ${ANSI.FG_GREEN}✓${ANSI.RESET} Grist manifest successfully generated in ${ANSI.FG_CYAN}/public${ANSI.RESET}`;
            const newLine = process.env.NODE_ENV === 'production' ? '\n' : '';
            log(`${newLine}${msg}${newLine}`);
        } catch (error) {
            console.error(`${ANSI.FG_BRIGHT_BLACK}[vite][plugin generate-grist-manifest]${ANSI.RESET} ${ANSI.FG_RED}✗ Error on Grist manifest generation:`, error, `${ANSI.RESET}\n`);
        }
    }
});

/**
 * Vite plugin to update the manifest in the dist folder after the build is finished.
 * It appends the current version and the timestamp.
 */
export const updateGristManifestDistPlugin = (pkg) => ({
    name: 'update-grist-manifest-dist',
    apply: 'build',
    closeBundle() {
        try {
            // Target the versioned directory within dist
            const strategy = (process.env.VITE_BUILD_STRATEGY || 'STANDARD').toLowerCase();
            const distFolderName = `v${pkg.version}-${strategy}`;
            const distDir = path.resolve(__dirname, '../../dist', distFolderName);
            const manifestPath = path.join(distDir, 'manifest.json');
            if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
                const widgetId = pkg.gristWidget?.widgetId;
                const widgetIndex = manifest.findIndex((w) => w.widgetId === widgetId);
                if (widgetIndex !== -1) {
                    // Update metadata
                    manifest[widgetIndex].lastUpdatedAt = new Date().toISOString();
                    manifest[widgetIndex].version = pkg.version;
                    const isPreview = process.env.PREVIEW_MODE === 'true';
                    const usedPort = isPreview ? '4173' : '5173';
                    const originalUrl = manifest[widgetIndex].url;
                    if (isPreview) {
                        manifest[widgetIndex].url = originalUrl.replace(':5173', `:${usedPort}`);
                    } else {
                        manifest[widgetIndex].url = originalUrl.replace(':4173', `:${usedPort}`);
                    }
                    manifest[widgetIndex].isPreview = isPreview;
                    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

                    const msg = `${ANSI.FG_BRIGHT_BLACK}[vite][plugin update-grist-manifest-dist]${ANSI.RESET} ${ANSI.FG_GREEN}✓${ANSI.RESET} Grist manifest successfully updated in ${ANSI.FG_CYAN}./dist/${distFolderName}/manifest.json${ANSI.RESET} for version ${ANSI.FG_CYAN}${pkg.version}${ANSI.RESET}`;
                    const newLine = process.env.NODE_ENV === 'production' ? '\n' : '';
                    log(`${newLine}${msg}${newLine}`);
                }
            }
        } catch (error) {
            console.error(`${ANSI.FG_BRIGHT_BLACK}[vite][plugin update-grist-manifest-dist]${ANSI.RESET} ${ANSI.FG_RED}✗ Error updating manifest in dist.`, error, `${ANSI.RESET}\n`);
        }
    }
});