export const isVerbose: boolean;

/**
 * Logs messages to the console only if verbose mode is enabled.
 */
export function log(...args: unknown[]): void;

/**
 * Displays a styled splashscreen in the console.
 */
export function showSplashscreen(options?: {
    title?: string;
    colorPrimary?: string;
    width?: number;
    clearConsole?: boolean;
    newlineBefore?: boolean;
    newlineAfter?: boolean;
}): void;

/**
 * Displays a section header in the console.
 */
export function showSection(message: string, options?: any): void;

/**
 * Displays network and local information for the Vite and Grist servers.
 */
export function showDevServerInfo(options?: {
    vitePort?: number;
    gristPort?: number;
}): void;

/**
 * Validates the presence and content of 'gristWidget' in package.json.
 * Throws an error and stops the process if requirements are not met.
 * @param pkg The content of package.json
 */
export function checkGristWidgetConfig(pkg: unknown): void;