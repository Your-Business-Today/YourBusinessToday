import { describe, expect, it } from 'vitest';
import { buildLoanStatement } from './loanStatement';
import type { StatementLine } from '../statement/accountStatement';

const augustYear = 8;

let journalNumber = 0;
const line = (journalDate: string, movement: { debit?: number; credit?: number }, balance: number): StatementLine => {
	journalNumber += 1;
	const journalId = `00000000-0000-4000-8000-${String(journalNumber).padStart(12, '0')}`;
	return {
		journalId,
		journalDate,
		description: `Entry ${journalNumber}`,
		kind: 'manual',
		costCentreId: null,
		debit: movement.debit ?? 0,
		credit: movement.credit ?? 0,
		position: 1,
		balance
	};
};

describe('a loan account read from the ledger', () => {
	it('marks each stretch it was overdrawn, when it goes overdrawn twice', () => {
		const lines = [
			line('2026-08-01', { credit: 500 }, 500),
			line('2026-08-10', { debit: 619.25 }, -119.25),
			line('2026-08-12', { debit: 30 }, -149.25),
			line('2026-09-01', { credit: 149.25 }, 0),
			line('2026-10-01', { debit: 250 }, -250),
			line('2026-10-20', { credit: 100 }, -150)
		];
		const statement = buildLoanStatement(lines, augustYear, '2026-11-13');
		expect(statement.overdrawnStretches).toEqual([
			{ from: '2026-08-10', to: '2026-09-01', mostOwed: 149.25 },
			{ from: '2026-10-01', to: null, mostOwed: 250 }
		]);
		expect(statement.totalIn).toBe(749.25);
		expect(statement.totalOut).toBe(899.25);
		expect(statement.balance).toBe(-150);
	});

	it('does not count a day whose entries net to nothing or more as overdrawn, whatever their order', () => {
		const lines = [line('2026-08-01', { debit: 200 }, -200), line('2026-08-01', { credit: 200 }, 0)];
		expect(buildLoanStatement(lines, augustYear, '2026-11-13').overdrawnStretches).toEqual([]);
	});

	it('gives the balance at each financial year end it crosses', () => {
		const lines = [
			line('2026-06-01', { credit: 1000 }, 1000),
			line('2026-07-31', { debit: 1250 }, -250),
			line('2026-08-01', { credit: 300 }, 50),
			line('2027-09-15', { debit: 10 }, 40)
		];
		const statement = buildLoanStatement(lines, augustYear, '2027-11-13');
		expect(statement.yearEnds).toEqual([
			{ yearEnd: '2026-07-31', balance: -250 },
			{ yearEnd: '2027-07-31', balance: 50 }
		]);
		expect(statement.overdrawnStretches).toEqual([{ from: '2026-07-31', to: '2026-08-01', mostOwed: 250 }]);
	});

	it('reads an account with no entries as owing nothing, with no year end', () => {
		const statement = buildLoanStatement([], augustYear, '2026-11-13');
		expect(statement).toMatchObject({
			lines: [],
			totalIn: 0,
			totalOut: 0,
			balance: 0,
			overdrawnStretches: [],
			yearEnds: []
		});
	});
});
