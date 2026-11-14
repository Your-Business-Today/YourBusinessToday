import { fromPence, toPence } from '../money';

/**
 * A statement line as the Bank page lists it: when, with whom, its reference, the money it brought in or took out, the
 * balance after it, and what in the books it is matched to.
 */
export type BankLineRow = {
	id: string;
	date: string;
	counterparty: string;
	reference: string;
	moneyIn: number | null;
	moneyOut: number | null;
	balance: number | null;
	isMatched: boolean;
	matchedTo: string;
};

export const bankTabKeys = ['toMatch', 'matched', 'all'] as const;

export type BankTabKey = (typeof bankTabKeys)[number];

const isOnTab: Record<BankTabKey, (row: BankLineRow) => boolean> = {
	toMatch: (row) => !row.isMatched,
	matched: (row) => row.isMatched,
	all: () => true
};

/** The lines a tab lists, in the statement's order: those still to match, those matched, or every one. */
export function bankLinesOnTab(rows: BankLineRow[], tabKey: BankTabKey): BankLineRow[] {
	return rows.filter(isOnTab[tabKey]);
}

/** A statement line's amount and the balance the statement gives after it, when it gives one. */
export type StatementMovement = { amount: number; balanceAfter: number | null };

/**
 * The balance after each line in the statement's order: the one the statement gives, or the last one given carried on by
 * the amounts since; nothing before the first line that gives one.
 */
export function statementBalancesOf(movements: StatementMovement[]): (number | null)[] {
	let carried: number | null = null;
	return movements.map((movement) => {
		carried = balanceAfterOf(movement, carried);
		return carried;
	});
}

function balanceAfterOf({ amount, balanceAfter }: StatementMovement, carried: number | null): number | null {
	if (balanceAfter !== null) return balanceAfter;
	if (carried === null) return null;
	return fromPence(toPence(carried) + toPence(amount));
}

const nothing = 0;

/** The money a line brought in, or nothing when it took money out. */
export function moneyInOf(amount: number): number | null {
	return amount > nothing ? amount : null;
}

/** The money a line took out, as a figure above zero, or nothing when it brought money in. */
export function moneyOutOf(amount: number): number | null {
	return amount < nothing ? -amount : null;
}
