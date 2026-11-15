import { largestFigure } from './filedFigures';

/** A screen keeps companies with at least this much cash at bank unless the person starting it names another figure. */
export const defaultLeastCash = 100_000;

/** The column limits of cash_screens (0241), stated once for the door and the migration to agree on. */
export const cashScreenLimits = { leastCash: largestFigure, sector: 10, sicCode: 5 };

/** What a screen is narrowed by, as the door accepted it. */
export type CashScreenNarrowing = { sector: string; sicCode: string; leastCash: number };

const wholePounds = /^\d+$/;
const postcodeSector = /^[A-Z]{1,2}\d[A-Z\d]? \d$/;
const sicCodeStart = /^\d{2,5}$/;

export const cashScreenFieldRules = {
	leastCash: `leastCash must be whole pounds written as digits, from 1 to ${largestFigure}, such as 100000, or left out for ${defaultLeastCash}.`,
	sector: 'sector must be a postcode sector in capitals, such as SM1 4, or left out.',
	sicCode: 'sicCode must be 2 to 5 digits, such as 41 or 41202, or left out.'
};

/** The narrowing as sent, or the refusal naming the field and what it takes; nothing is rounded or repaired. */
export function readCashScreenNarrowing(sector: string, sicCode: string, leastCashText: string): CashScreenNarrowing | string {
	const isSectorFitting = sector === '' || postcodeSector.test(sector);
	if (!isSectorFitting) return cashScreenFieldRules.sector;
	const isSicCodeFitting = sicCode === '' || sicCodeStart.test(sicCode);
	if (!isSicCodeFitting) return cashScreenFieldRules.sicCode;
	const isLeastCashLeftOut = leastCashText === '';
	if (isLeastCashLeftOut) return { sector, sicCode, leastCash: defaultLeastCash };
	const isWholePounds = wholePounds.test(leastCashText);
	if (!isWholePounds) return cashScreenFieldRules.leastCash;
	const leastCash = Number(leastCashText);
	const isWithinLimits = leastCash >= 1 && leastCash <= cashScreenLimits.leastCash;
	if (!isWithinLimits) return cashScreenFieldRules.leastCash;
	return { sector, sicCode, leastCash };
}
