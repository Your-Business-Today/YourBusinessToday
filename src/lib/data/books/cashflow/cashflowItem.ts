import type { MonthKey } from '../monthKey';

/** Which way a forecast item moves cash: into the bank or out of it, as books_cashflow_items.direction holds it (migration 0284). */
export const CashflowDirections = { moneyIn: 'in', moneyOut: 'out' } as const;

export type CashflowDirection = (typeof CashflowDirections)[keyof typeof CashflowDirections];

export const cashflowDirectionNames = Object.values(CashflowDirections);

/** How often a forecast item comes round: in its first month alone, or every month, quarter or year from it. */
export const CashflowRepeats = { once: 'once', monthly: 'monthly', quarterly: 'quarterly', yearly: 'yearly' } as const;

export type CashflowRepeat = (typeof CashflowRepeats)[keyof typeof CashflowRepeats];

export const cashflowRepeatNames = Object.values(CashflowRepeats);

/** The months from one time an item comes round to the next. */
export const monthsBetweenRepeats: Record<CashflowRepeat, number> = { once: 0, monthly: 1, quarterly: 3, yearly: 12 };

export const cashflowDirectionLabels: Record<CashflowDirection, string> = { in: 'Money in', out: 'Money out' };

export const cashflowRepeatLabels: Record<CashflowRepeat, string> = { once: 'Once', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' };

/** The limits books_cashflow_items holds an item to, stated once for the service and any form. */
export const CashflowItemLimits = { longestTitle: 120, longestNotes: 1000 } as const;

/**
 * What a forecast item is: what it is called, which way the money moves, how much each time, how often, the month it first
 * comes round and the last month it can, null while it carries on, and any notes.
 */
export type CashflowItemSettings = {
	title: string;
	direction: CashflowDirection;
	amount: number;
	repeats: CashflowRepeat;
	firstMonth: MonthKey;
	lastMonth: MonthKey | null;
	notes: string;
};

/** A forecast item as the books keep it. */
export type CashflowItem = CashflowItemSettings & { id: string };
