import { fromPence, toPence } from '$lib/data/books/money';

type StatementLine = { date: string; counterparty: string; reference: string; kind: string; amount: number; balanceAfter: number };

const startingPence = 0;
const statementStart = Date.UTC(2026, 6, 30);
const dayInMilliseconds = 86_400_000;
const daysBetweenLines = [0, 1, 1, 2];
const dateLength = 10;

const payees = [
	{ counterparty: 'BEADLE EM & GJ', reference: 'JAMES LOAN', kind: 'FASTER PAYMENT', amount: 500 },
	{ counterparty: 'ANTHROPIC', reference: 'CLAUDE', kind: 'CARD PAYMENT', amount: -18 },
	{ counterparty: 'GITHUB', reference: 'COPILOT', kind: 'CARD PAYMENT', amount: -8.4 },
	{ counterparty: 'COSTA COFFEE', reference: '', kind: 'CONTACTLESS', amount: -3.45 },
	{ counterparty: 'SUPABASE', reference: 'PRO PLAN', kind: 'CARD PAYMENT', amount: -19.73 },
	{ counterparty: 'JEWEL BESPOKE BUILD', reference: 'INV-2', kind: 'FASTER PAYMENT', amount: 250 }
];

/** A statement of 78 lines from 30 Jul 2026, oldest first, with a balance on each line. */
export function seventyEightLineStatement(): StatementLine[] {
	let balancePence = startingPence;
	let day = statementStart;
	return Array.from({ length: 78 }, (_, index) => {
		const payee = payees[index % payees.length];
		day += daysBetweenLines[index % daysBetweenLines.length] * dayInMilliseconds;
		balancePence += toPence(payee.amount);
		const date = new Date(day).toISOString().slice(0, dateLength);
		return { ...payee, date, balanceAfter: fromPence(balancePence) };
	});
}

/** The statement's lines as the person's Claude gives them, without the balances. */
export function withoutBalances(lines: StatementLine[]) {
	return lines.map(({ balanceAfter: _balanceAfter, ...line }) => line);
}
