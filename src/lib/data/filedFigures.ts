import { formatBritishDate } from './britishDate';

/** What a company's latest filed accounts say about its state, as read from the accounts it filed. */
export type FiledFigures = {
	netAssets: number | null;
	cash: number | null;
	creditors: number | null;
	averageEmployees: number | null;
	madeUpTo: string;
	sourceUrl: string;
};

/** The column holds sixteen digits; a figure beyond this is a misread, not a balance sheet. */
export const largestFigure = 99_999_999_999_999;
export const mostEmployees = 10_000_000;

/** Why the figures cannot be stored as read, or null when every value fits its column. */
export function validateFiledFigures(figures: FiledFigures): string | null {
	const amounts = [figures.netAssets, figures.cash, figures.creditors];
	const isTooLarge = amounts.some((amount) => amount !== null && Math.abs(amount) > largestFigure);
	if (isTooLarge) return `The figures made up to ${figures.madeUpTo} are beyond ${largestFigure}: misread, not stored.`;
	const { averageEmployees } = figures;
	const isNotAHeadcount = averageEmployees !== null && (averageEmployees < 0 || averageEmployees > mostEmployees || !Number.isInteger(averageEmployees));
	if (isNotAHeadcount) return `The employee count made up to ${figures.madeUpTo} is not a headcount: misread, not stored.`;
	return null;
}

/** "Net assets £84k · cash £12k · creditors £31k · 4 employees · to 31 Mar 2026"; creditors are what is owed, so never negative here. */
export function describeFiledFigures(figures: FiledFigures): string {
	const employees = figures.averageEmployees;
	return [
		figures.netAssets === null ? '' : `Net assets ${formatPounds(figures.netAssets)}`,
		figures.cash === null ? '' : `cash ${formatPounds(figures.cash)}`,
		figures.creditors === null ? '' : `creditors ${formatPounds(Math.abs(figures.creditors))}`,
		employees === null ? '' : `${employees} employee${employees === 1 ? '' : 's'}`,
		`to ${formatBritishDate(figures.madeUpTo)}`
	]
		.filter((part) => part !== '')
		.join(' · ');
}

const thousand = 1_000;
const million = 1_000_000;

export function formatPounds(amount: number): string {
	const sign = amount < 0 ? '-' : '';
	const size = Math.abs(amount);
	const millions = (size / million).toFixed(1).replace(/\.0$/, '');
	if (size >= million) return `${sign}£${millions}m`;
	if (size >= thousand) return `${sign}£${Math.round(size / thousand)}k`;
	return `${sign}£${Math.round(size)}`;
}
