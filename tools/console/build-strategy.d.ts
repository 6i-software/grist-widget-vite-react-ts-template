/**
 * Resolves the build strategy based on CLI arguments or environment variables.
 */
export function resolveBuildStrategy(): 'SPA' | 'STANDARD';

/**
 * Returns a human-readable label for the given build strategy.
 * * @param buildStrategy The strategy to label
 */
export function getBuildStrategyLabel(buildStrategy: BuildStrategy): string;