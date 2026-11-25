import { CostShareWeightLimits } from './costShareWeights';

const scale = 10 ** CostShareWeightLimits.decimalPlaces;

/**
 * Whole pence split in proportion to the weights, each part rounded down and the pence left over given one at a time
 * to the parts that lost most to rounding, the first among equals first, so the parts add up exactly.
 */
export function splitPenceByWeight(pence: number, weights: number[]): number[] {
	const units = weights.map((weight) => Math.round(weight * scale));
	const totalUnits = units.reduce((total, unit) => total + unit, 0);
	const shares = units.map((unit) => ({ whole: Math.floor((pence * unit) / totalUnits), lost: (pence * unit) % totalUnits }));
	const leftOver = pence - shares.reduce((total, share) => total + share.whole, 0);
	const takers = shares.map((share, index) => ({ ...share, index })).sort((first, second) => second.lost - first.lost || first.index - second.index);
	const extraFor = new Set(takers.slice(0, leftOver).map((taker) => taker.index));
	return shares.map((share, index) => share.whole + (extraFor.has(index) ? 1 : 0));
}
