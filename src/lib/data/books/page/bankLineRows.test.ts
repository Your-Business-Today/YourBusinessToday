import { describe, expect, it } from 'vitest';
import { bankLinesOnTab, moneyInOf, moneyOutOf, statementBalancesOf, type BankLineRow } from './bankLineRows';

const lineOf = (id: string, isMatched: boolean): BankLineRow => ({
	id,
	date: '2026-11-10',
	counterparty: 'Vercel',
	reference: 'Hosting',
	moneyIn: null,
	moneyOut: 20,
	balance: null,
	isMatched,
	matchedTo: isMatched ? 'Hosting for November' : ''
});

const hosting = lineOf('hosting', true);
const domain = lineOf('domain', false);
const lines = [hosting, domain];

describe('bankLinesOnTab', () => {
	it('lists the lines still to match on To match, the matched ones on Matched and every one on All', () => {
		expect(bankLinesOnTab(lines, 'toMatch')).toEqual([domain]);
		expect(bankLinesOnTab(lines, 'matched')).toEqual([hosting]);
		expect(bankLinesOnTab(lines, 'all')).toEqual(lines);
	});
});

describe('statementBalancesOf', () => {
	it('gives the balance the statement gives, and carries the last one on by the amounts after it', () => {
		const movements = [
			{ amount: 10.1, balanceAfter: null },
			{ amount: 100, balanceAfter: 1250 },
			{ amount: -0.3, balanceAfter: null },
			{ amount: 20.2, balanceAfter: null },
			{ amount: -50, balanceAfter: 1000 }
		];
		expect(statementBalancesOf(movements)).toEqual([null, 1250, 1249.7, 1269.9, 1000]);
	});
});

describe('moneyInOf and moneyOutOf', () => {
	it('put money in under In and money out under Out, as a figure above zero', () => {
		expect([moneyInOf(12.5), moneyOutOf(12.5)]).toEqual([12.5, null]);
		expect([moneyInOf(-12.5), moneyOutOf(-12.5)]).toEqual([null, 12.5]);
	});
});
