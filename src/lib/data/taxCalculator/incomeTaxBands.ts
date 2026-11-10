import type { TaxBand } from './taxRuleTypes';

const band = (name: string, rate: number, startsAt: number, isHigherRate = false): TaxBand => ({
	name,
	rate,
	startsAt,
	isHigherRate
});

export const restOfUkBands: TaxBand[] = [
	band('Basic rate', 0.2, 0),
	band('Higher rate', 0.4, 37700, true),
	band('Additional rate', 0.45, 125140, true)
];

export const scottishBandsFor2025To2026: TaxBand[] = [
	band('Starter rate', 0.19, 0),
	band('Basic rate', 0.2, 2827),
	band('Intermediate rate', 0.21, 14921),
	band('Higher rate', 0.42, 31092, true),
	band('Advanced rate', 0.45, 62430, true),
	band('Top rate', 0.48, 125140, true)
];

export const scottishBandsFor2026To2027: TaxBand[] = [
	band('Starter rate', 0.19, 0),
	band('Basic rate', 0.2, 3967),
	band('Intermediate rate', 0.21, 16956),
	band('Higher rate', 0.42, 31092, true),
	band('Advanced rate', 0.45, 62430, true),
	band('Top rate', 0.48, 125140, true)
];
