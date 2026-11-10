import { describe, expect, it } from 'vitest';
import { compareRowCounts, hasLostRows } from './tableRowCountChange';

describe('comparing two readings of every table’s row count', () => {
	const changes = compareRowCounts({ clients: 12, journals: 4, old_ledger: 3 }, { books_entries: 0, clients: 13, journals: 2 });

	it('lists every table in either reading, by name', () => {
		expect(changes.map((change) => change.tableName)).toEqual(['books_entries', 'clients', 'journals', 'old_ledger']);
	});

	it('marks a table missing from a reading as not there', () => {
		expect(changes[0]).toEqual({ tableName: 'books_entries', earlierCount: null, laterCount: 0 });
		expect(changes[3]).toEqual({ tableName: 'old_ledger', earlierCount: 3, laterCount: null });
	});

	it('finds the tables that hold fewer rows, a table that is gone among them, and not a new one', () => {
		expect(changes.filter(hasLostRows).map((change) => change.tableName)).toEqual(['journals', 'old_ledger']);
	});
});
