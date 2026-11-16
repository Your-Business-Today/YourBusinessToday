/** How a quote line's fee is charged: once, each month, or by the day. */
export type FeeBasis = 'fixed' | 'monthly' | 'daily';

export const feeBasisLabels: Record<FeeBasis, string> = {
	fixed: 'fixed',
	monthly: 'a month',
	daily: 'a day'
};

export const feeBases = Object.keys(feeBasisLabels) as FeeBasis[];

/** The limits on a quote, stated once and mirrored by the checks on migration 0261's columns. */
export const leadQuoteLimits = {
	longestTitle: 120,
	longestIntroduction: 2000,
	longestTerms: 2000,
	longestLineName: 120,
	longestDelivers: 600,
	longestTiming: 120,
	longestFeeNote: 200,
	mostLines: 30,
	largestFeeAmount: 9999999999.99
} as const;

/** A stage of the plan or a running service, with its fee: an amount on its basis, or no amount and a note. */
export type LeadQuoteLine = {
	name: string;
	delivers: string;
	timing: string;
	feeBasis: FeeBasis;
	feeAmount: number | null;
	feeNote: string;
};

/** A quote as it is filed, checked by validateLeadQuote before anything is written. */
export type LeadQuoteFiled = {
	clientId: string;
	title: string;
	preparedOn: string;
	validUntil: string | null;
	introduction: string;
	terms: string;
	lines: LeadQuoteLine[];
};

/** One filed version of a quote, as the page and the connector read it. */
export type LeadQuote = Omit<LeadQuoteFiled, 'clientId'> & {
	id: string;
	version: number;
	filedAt: string;
};

/** A filed version, named and dated, for the list of earlier versions. */
export type LeadQuoteVersion = { version: number; title: string; filedAt: string };

export function isFeeBasis(candidate: string): candidate is FeeBasis {
	return feeBases.some((basis) => basis === candidate);
}
