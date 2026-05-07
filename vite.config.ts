import {defineConfig, loadEnv} from 'vite'
import react, {reactCompilerPreset} from '@vitejs/plugin-react'
import {viteSingleFile} from "vite-plugin-singlefile";
import babel from '@rolldown/plugin-babel'
import pkg from './package.json'

import {
    generateGristManifestPlugin,
    updateGristManifestDistPlugin
} from './tools/vite-plugins/grist-manifest.js';
import {ANSI} from "./tools/console/ansi";
import {isVerbose} from "./tools/console/helper";

// https://vite.dev/config/
export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '');
    const buildStrategy = (env.VITE_BUILD_STRATEGY || 'STANDARD').toUpperCase();
    const isSPA = (buildStrategy === 'SPA');

    if(isVerbose) {
        console.log(`${ANSI.FG_BRIGHT_BLACK}[vite]${ANSI.RESET} Dotenv mode: ${ANSI.FG_CYAN}${mode}${ANSI.RESET}`);
    }

    const buildConfigBase = {
        sourcemap: false,
        emptyOutDir: true,
        reportCompressedSize: true,
        chunkSizeWarningLimit: 500,
        target: 'esnext',
        outDir: `dist/v${pkg.version}`,
    };
    const buildConfigs = {
        SPA: {
            ...buildConfigBase,
            assetsInlineLimit: 100000000,
            cssCodeSplit: false,
        },
        STANDARD: {
            ...buildConfigBase,
            assetsInlineLimit: 4096,
            rollupOptions: {
                output: {
                    /**
                     * Strategy for code splitting (chunking) and cache busting.
                     * Separates third-party libraries into distinct files to improve browser caching.
                     *
                     * @param id - The absolute path of the module being bundled.
                     */
                    manualChunks(id: string) {
                        if (id.includes('node_modules')) {
                            // Group React-related packages into a specific 'vendor-react' chunk
                            // since they rarely change and can be cached long-term.
                            if (id.includes('react')) {
                                return 'vendor-react';
                            }
                            // Group all other dependencies into a general 'vendor' chunk.
                            return 'vendor';
                        }
                    }
                }
            }
        }
    };

    return {
        plugins: [
            react(),
            babel({presets: [reactCompilerPreset()]}),
            isSPA ? viteSingleFile() : null,
            generateGristManifestPlugin(pkg),
            updateGristManifestDistPlugin(pkg)
        ].filter(Boolean),

        server: {
            host: '0.0.0.0',
            allowedHosts: [
                'host.docker.internal',
                'localhost'
            ]
        },

        build: isSPA ? buildConfigs.SPA : buildConfigs.STANDARD,
    }
});