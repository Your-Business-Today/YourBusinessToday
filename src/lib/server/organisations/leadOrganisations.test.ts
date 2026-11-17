import { describe, expect, it, vi } from 'vitest';

type Row = Record<string, unknown>;
type Filter = (row: Row) => boolean;

const tables: Record<string, Row[]> = {
	organisations: [
		{ id: 'lead-organisation', client_id: 'lead-company' },
		{ id: 'client-organisation', client_id: 'signed-company' }
	],
	clients: [
		{ id: 'lead-company', lifecycle_stage: 'lead' },
		{ id: 'signed-company', lifecycle_stage: 'client' }
	]
};

function columnOf(table: string, column: string): string {
	const knownColumns = Object.keys(tables[table][0]);
	if (!knownColumns.includes(column)) throw new Error(`column ${table}.${column} does not exist`);
	return column;
}

function queryOn(table: string) {
	const filters: Filter[] = [];
	const query = {
		select: () => query,
		in: (column: string, values: unknown[]) => {
			const known = columnOf(table, column);
			filters.push((row) => values.includes(row[known]));
			return query;
		},
		not: (column: string) => {
			const known = columnOf(table, column);
			filters.push((row) => row[known] !== null);
			return query;
		},
		then: (settle: (result: { data: Row[]; error: null }) => unknown) =>
			Promise.resolve(settle({ data: tables[table].filter((row) => filters.every((keeps) => keeps(row))), error: null }))
	};
	return query;
}

vi.mock('$lib/server/payments/supabaseServiceClient', () => ({ supabaseServiceClient: () => ({ from: queryOn }) }));

const { findLeadOrganisationIds } = await import('./leadOrganisations');

describe('the organisations kept out of the picker', () => {
	it('are those opened for a company still on the Leads register, read by its lifecycle stage', async () => {
		await expect(findLeadOrganisationIds()).resolves.toEqual(new Set(['lead-organisation']));
	});
});
