import { describe, expect, it } from 'vitest';
import { findNewStatementLines, type KeptBankLine } from './bankStatementNewLines';
import type { PlacedBankLine } from './bankStatementRules';

const annys = { date: '2026-10-24', counterparty: 'ANNYS', reference: 'ANNYS     ', kind: 'CARD PAYMENT', amount: -24.99, balanceAfter: null };
const coffee = { date: '2026-11-05', counterparty: 'COSTA COFFEE', reference: '', kind: 'CONTACTLESS', amount: -3.45, balanceAfter: null };

const placed = (lines: Omit<PlacedBankLine, 'position' | 'occurrence'>[]): PlacedBankLine[] =>
	lines.map((line, index) => ({ ...line, position: index + 1, occurrence: 1 }));
const kept = (line: typeof annys, occurrence: number): KeptBankLine => ({ ...line, occurrence });

describe('telling the statement lines the account does not keep yet', () => {
	it('counts a line that differs from a kept one only by spaces at the ends of its words as already there, either way round', () => {
		const trimmed = { ...annys, reference: 'ANNYS', counterparty: ' ANNYS ' };
		expect(findNewStatementLines(placed([trimmed]), [kept(annys, 1)])).toEqual([]);
		expect(findNewStatementLines(placed([annys]), [kept(trimmed, 1)])).toEqual([]);
	});

	it('keeps a new line exactly as given', () => {
		const [line] = findNewStatementLines(placed([annys]), []);
		expect(line).toEqual(expect.objectContaining({ reference: 'ANNYS     ', occurrence: 1 }));
	});

	it('keeps two identical lines on one day, and adds a third when the statement holds three', () => {
		expect(findNewStatementLines(placed([coffee, coffee]), []).map((line) => line.occurrence)).toEqual([1, 2]);
		const third = findNewStatementLines(placed([coffee, coffee, coffee]), [kept(coffee, 1), kept(coffee, 2)]);
		expect(third).toEqual([expect.objectContaining({ position: 3, occurrence: 3 })]);
	});

	it('gives a new line an occurrence no kept line of the same words holds, when a line before it was taken out', () => {
		const added = findNewStatementLines(placed([coffee, coffee]), [kept(coffee, 2)]);
		expect(added).toEqual([expect.objectContaining({ position: 2, occurrence: 3 })]);
	});

	it('gives a line spelt with end spaces its own first occurrence beside a kept line of the trimmed words', () => {
		const spaced = { ...coffee, counterparty: 'COSTA COFFEE ' };
		const added = findNewStatementLines(placed([coffee, spaced]), [kept(coffee, 1)]);
		expect(added).toEqual([expect.objectContaining({ counterparty: 'COSTA COFFEE ', occurrence: 1 })]);
	});
});
