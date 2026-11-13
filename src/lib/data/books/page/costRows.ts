import { formatPoundsAndPence, sumMoney } from '$lib/data/books/money';

/** A cost as the Costs page lists it: when, from whom, for what, the account it is coded to, how much, and when it was paid. */
export type CostRow = {
	id: string;
	date: string;
	supplier: string;
	what: string;
	account: string;
	amount: number;
	paidOn: string | null;
};

export const costTabKeys = ['unpaid', 'paid', 'all'] as const;

export type CostTabKey = (typeof costTabKeys)[number];

const isOnTab: Record<CostTabKey, (row: CostRow) => boolean> = {
	unpaid: (row) => row.paidOn === null,
	paid: (row) => row.paidOn !== null,
	all: () => true
};

/** The costs a tab lists: those still owed, those paid, or every one. */
export function costsOnTab(rows: CostRow[], tabKey: CostTabKey): CostRow[] {
	return rows.filter(isOnTab[tabKey]);
}

/** What the business owes its suppliers, in one line: the sum of the unpaid costs and how many there are. */
export function describeOwedToSuppliers(rows: CostRow[]): string {
	const unpaid = costsOnTab(rows, 'unpaid');
	if (unpaid.length === 0) return 'Nothing is owed to suppliers.';
	const owed = formatPoundsAndPence(sumMoney(unpaid.map((row) => row.amount)));
	const unpaidCosts = unpaid.length === 1 ? 'one unpaid cost' : `${unpaid.length} unpaid costs`;
	return `${owed} is owed to suppliers, across ${unpaidCosts}.`;
}
