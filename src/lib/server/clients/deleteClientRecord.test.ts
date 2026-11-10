import { describe, expect, it } from 'vitest';
import { deleteClientRecord } from './deleteClientRecord';
import { noContinuityCopy } from '$lib/data/continuityCopy';
import type { Client } from './clientRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

type Write = { table: string; operation: string };
type Query = { operation: string; column: string; isCount: boolean };
type FakeDatabase = { counts: Record<string, number>; deleteFailure: { code: string } | null; writes: Write[] };

const operations = { select: 'select', insert: 'insert', delete: 'delete' } as const;
const deletionRecordId = 'deletion-1';
const client = { id: 'client-1', name: 'Jewel', continuityCopy: noContinuityCopy } as Client;

function answerTo(table: string, query: Query, database: FakeDatabase): unknown {
	if (query.isCount) return { count: database.counts[`${table}.${query.column}`] ?? 0, error: null };
	const isRead = query.operation === operations.select;
	if (isRead) return { data: { id: client.id, name: client.name }, error: null };
	database.writes.push({ table, operation: query.operation });
	const isInsert = query.operation === operations.insert;
	if (isInsert) return { data: { id: deletionRecordId }, error: null };
	const isClientsTable = table === 'clients';
	return { error: isClientsTable ? database.deleteFailure : null };
}

function queryOn(table: string, database: FakeDatabase) {
	const query: Query = { operation: operations.select, column: '', isCount: false };
	const chain = {
		select: (_columns: string, options?: { head?: boolean }) => {
			query.isCount = options?.head === true;
			return chain;
		},
		insert: () => {
			query.operation = operations.insert;
			return chain;
		},
		delete: () => {
			query.operation = operations.delete;
			return chain;
		},
		eq: (column: string) => {
			query.column = column;
			return chain;
		},
		single: () => chain,
		then: (resolve: (value: unknown) => unknown) => resolve(answerTo(table, query, database))
	};
	return chain;
}

function databaseHolding(counts: Record<string, number>, deleteFailure: { code: string } | null = null) {
	const database: FakeDatabase = { counts, deleteFailure, writes: [] };
	const service = { from: (table: string) => queryOn(table, database) } as unknown as SupabaseClient;
	return { service, writes: database.writes };
}

describe('deleteClientRecord', () => {
	it('never touches a client with projects', async () => {
		const { service, writes } = databaseHolding({ 'projects.client_id': 7 });
		const refusal = await deleteClientRecord(service, client, 'james');
		expect(refusal).toContain('it has 7 projects');
		expect(writes).toEqual([]);
	});

	it('records the deletion before the client goes', async () => {
		const { service, writes } = databaseHolding({});
		expect(await deleteClientRecord(service, client, 'james')).toBeNull();
		expect(writes).toEqual([
			{ table: 'client_deletions', operation: operations.insert },
			{ table: 'clients', operation: operations.delete }
		]);
	});

	it('takes the record back when the database still names the client', async () => {
		const { service, writes } = databaseHolding({}, { code: '23503' });
		const refusal = await deleteClientRecord(service, client, 'james');
		expect(refusal).toContain('another record still names it');
		expect(writes.at(-1)).toEqual({ table: 'client_deletions', operation: operations.delete });
	});
});
