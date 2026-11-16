import { sumMoney } from '$lib/data/books/money';
import type { FeeBasis, LeadQuoteLine } from '$lib/data/leadQuoteRules';

/** What a quote comes to: the fixed fees added, the monthly fees added, and the day rates listed, never added. */
export type LeadQuoteTotals = {
	toBuild: number;
	eachMonth: number;
	dayRates: LeadQuoteLine[];
};

export function totalsOfQuote(lines: LeadQuoteLine[]): LeadQuoteTotals {
	return {
		toBuild: sumOfBasis(lines, 'fixed'),
		eachMonth: sumOfBasis(lines, 'monthly'),
		dayRates: pricedLinesOfBasis(lines, 'daily')
	};
}

function sumOfBasis(lines: LeadQuoteLine[], basis: FeeBasis): number {
	const amounts = pricedLinesOfBasis(lines, basis).map((line) => line.feeAmount ?? 0);
	return sumMoney(amounts);
}

function pricedLinesOfBasis(lines: LeadQuoteLine[], basis: FeeBasis): LeadQuoteLine[] {
	return lines.filter((line) => line.feeBasis === basis && line.feeAmount !== null);
}
