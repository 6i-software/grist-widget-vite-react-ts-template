import {ANSI} from "./ansi.js";

/**
 * Resolves the build strategy based on CLI arguments or environment variables.
 *
 * Hierarchy priority:
 *  1. Flag variable --spa/--standard
 *  2. Define variable --VITE_BUILD_STRATEGY=...
 *  3. Process .env
 *  4. Default value "STANDARD"
 */
export const resolveBuildStrategy = () => {
    const args = process.argv;
    const ALLOWED_STRATEGIES = ['SPA', 'STANDARD'];

    let strategy;

    if (args.includes('--spa')) {
        strategy = 'SPA';
    } else if (args.includes('--standard')) {
        strategy = 'STANDARD';
    } else {
        const explicitArg = args.find(arg => arg.startsWith('--VITE_BUILD_STRATEGY='));
        if (explicitArg) {
            strategy = explicitArg.split('=')[1].toUpperCase();
        } else {
            strategy = (process.env.VITE_BUILD_STRATEGY || 'STANDARD').toUpperCase();
        }
    }

    if (!ALLOWED_STRATEGIES.includes(strategy)) {
        console.error(
            `${ANSI.FG_BRIGHT_BLACK}[vite-build]${ANSI.RESET} ${ANSI.FG_RED}✗ Error: Invalid build strategy: ${ANSI.RESET}${strategy}\n` +
            `${ANSI.FG_RED}Allowed values are: ${ALLOWED_STRATEGIES.join(', ')}${ANSI.RESET}\n`
        );
        throw new Error(`Invalid build strategy: ${strategy}`);
    }

    return strategy;
};

export const getBuildStrategyLabel = (buildStrategy) => {
    return buildStrategy === 'SPA'
        ? "SPA (Single Page Application)"
        : "STANDARD (Optimized assets splitting)";
};

