import type { EntriesSpan } from './booksPeriodQuery';

/** A figure on a statement and the page of entries behind it; a blank figure is a column with nothing in it. */
export type StatementFigure = { amount: number | null; href: string | null };

export const StatementRowWeights = { heading: 'heading', line: 'line', total: 'total' } as const;

export type StatementRowWeight = (typeof StatementRowWeights)[keyof typeof StatementRowWeights];

/** One row of a statement as the books page shows it: a section's heading, an account's line, or a total. */
export type StatementRow = {
	key: string;
	label: string;
	href: string | null;
	weight: StatementRowWeight;
	figures: StatementFigure[];
};

/** Gives the address of the entries behind an account's figure over a span of days. */
export type EntriesLinker = (accountCode: string, span: EntriesSpan) => string;

type NamedAccount = { accountCode: string; accountName: string };

const headingKeyPrefix = 'heading';
const totalKeyPrefix = 'total';

export function headingRow(label: string): StatementRow {
	return { key: `${headingKeyPrefix}-${label}`, label, href: null, weight: StatementRowWeights.heading, figures: [] };
}

export function accountRow(account: NamedAccount, figures: StatementFigure[]): StatementRow {
	const label = `${account.accountCode} ${account.accountName}`;
	const href = figures[0]?.href ?? null;
	return { key: account.accountCode, label, href, weight: StatementRowWeights.line, figures };
}

/** A line made of no one account, such as retained earnings, so it has no entries to open. */
export function unlinkedRow(label: string, amount: number): StatementRow {
	return { key: label, label, href: null, weight: StatementRowWeights.line, figures: [{ amount, href: null }] };
}

export function totalRow(label: string, amounts: number[]): StatementRow {
	const figures = amounts.map((amount) => ({ amount, href: null }));
	return { key: `${totalKeyPrefix}-${label}`, label, href: null, weight: StatementRowWeights.total, figures };
}
