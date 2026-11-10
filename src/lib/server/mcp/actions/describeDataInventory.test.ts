import { describe, expect, it } from 'vitest';
import { describeDataInventories, noInventoryYet } from './describeDataInventory';
import type { DataInventory } from '$lib/server/dataInventory/dataInventoryRecord';

const before: DataInventory = {
	migrationRunId: 'run-1',
	moment: 'before',
	takenAt: '2026-11-10T17:00:01Z',
	commitSha: 'abc1234def5678',
	migrationFiles: ['0145_data_inventories.sql'],
	rowCounts: { clients: 12, ledger_accounts: 40 }
};

const after: DataInventory = {
	...before,
	moment: 'after',
	takenAt: '2026-11-10T17:00:03Z',
	rowCounts: { clients: 12, data_inventories: 0, ledger_accounts: 38 }
};

describe('reading the data inventory', () => {
	it('says when no inventory is kept yet', () => {
		expect(describeDataInventories([])).toBe(noInventoryYet);
	});

	it('gives the only reading with every table’s count', () => {
		const answer = describeDataInventories([before]);
		expect(answer).toContain('The only reading: before the migrations of commit abc1234 (0145_data_inventories.sql)');
		expect(answer).toContain('- ledger_accounts: 40');
	});

	it('compares the latest reading with the one before it, naming the tables that lost rows', () => {
		const answer = describeDataInventories([after, before]);
		expect(answer).toContain('The latest reading: after the migrations of commit abc1234');
		expect(answer).toContain('The one before it: before the migrations of commit abc1234');
		expect(answer).toContain('fewer rows than in the reading before: ledger_accounts (40 → 38).');
		expect(answer).toContain('- data_inventories: not there → 0');
		expect(answer).toContain('- clients: 12 → 12');
	});

	it('says so when no table lost a row', () => {
		const answer = describeDataInventories([{ ...after, rowCounts: before.rowCounts }, before]);
		expect(answer).toContain('No table has fewer rows than in the reading before.');
	});
});
