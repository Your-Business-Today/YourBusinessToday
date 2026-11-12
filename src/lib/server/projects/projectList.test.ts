import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { projectList } from './projectList';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;
type SavedOrder = { functionName: string; functionArguments: Row };

const migration = readFileSync('migrations/0206_one_projects_list.sql', 'utf8');

const ownRow = (id: string, teamProjectsAbove: number): Row => ({ id, team_projects_above: teamProjectsAbove });
const membershipRow = (projectId: string): Row => ({ project_id: projectId });

/** A database holding one person's two boards, each in its own order, that keeps the orders it is asked to save. */
function databaseHolding(ownRows: Row[], membershipRows: Row[]) {
	const rowsByTable: Record<string, Row[]> = { projects: ownRows, project_members: membershipRows };
	const savedOrders: SavedOrder[] = [];
	const supabase = {
		from(table: string) {
			const rowsRead = Promise.resolve({ data: rowsByTable[table], error: null });
			const query = { select: () => query, eq: () => query, order: () => query, then: rowsRead.then.bind(rowsRead) };
			return query;
		},
		rpc: async (functionName: string, functionArguments: Row) => {
			savedOrders.push({ functionName, functionArguments });
			return { error: null };
		}
	};
	return { supabase: supabase as unknown as SupabaseClient, savedOrders };
}

describe('a person’s projects list', () => {
	const ownRows = [ownRow('bakery-app', 0), ownRow('florist-site', 1)];
	const membershipRows = [membershipRow('life-record'), membershipRow('skill-swap')];

	it('numbers the projects they own and the ones they are on as one list', async () => {
		const { supabase } = databaseHolding(ownRows, membershipRows);
		expect(await projectList(supabase, 'ada').load()).toEqual([
			{ id: 'bakery-app', place: 1 },
			{ id: 'life-record', place: 2 },
			{ id: 'florist-site', place: 3 },
			{ id: 'skill-swap', place: 4 }
		]);
	});

	it('saves a new order by naming its projects to the function the migration makes', async () => {
		const { supabase, savedOrders } = databaseHolding(ownRows, membershipRows);
		const list = projectList(supabase, 'ada');
		const newOrder = [...(await list.load())].reverse();
		await list.save(newOrder);
		const projectIds = ['skill-swap', 'florist-site', 'life-record', 'bakery-app'];
		expect(savedOrders).toEqual([
			{ functionName: 'save_project_list_order', functionArguments: { list_owner: 'ada', project_ids: projectIds } }
		]);
		expect(migration).toContain('function public.save_project_list_order(list_owner uuid, project_ids uuid[])');
	});
});
