import { describe, expect, it } from 'vitest';
import { withProjectWork } from './portalProjectWork';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

const rowsBySurface: Record<string, Row[]> = {
	portal_goals: [
		{ id: 'goal-1', project_id: 'project-1' },
		{ id: 'goal-2', project_id: 'project-2' }
	],
	portal_tasks: [{ id: 'task-1', project_id: 'project-1' }]
};

const contextColumn = 'context_version_number';
const columnMissing = { code: '42703', message: `column portal_goals.${contextColumn} does not exist` };

function fakeSupabase(surfacesRead: string[], isMigrated = true): SupabaseClient {
	const from = (surface: string) => {
		surfacesRead.push(surface);
		let columnsRead = '';
		const query = {
			select: (columns: string) => {
				columnsRead = columns;
				return query;
			},
			in: () => query,
			order: async () => {
				const isMissing = !isMigrated && columnsRead.includes(contextColumn);
				if (isMissing) return { data: null, error: columnMissing };
				return { data: rowsBySurface[surface] ?? [], error: null };
			}
		};
		return query;
	};
	return { from } as unknown as SupabaseClient;
}

describe('withProjectWork', () => {
	it('reads goals and tasks only through the portal surfaces, never the tables', async () => {
		const surfacesRead: string[] = [];
		await withProjectWork(fakeSupabase(surfacesRead), [{ id: 'project-1' }]);
		expect(surfacesRead.sort()).toEqual(['portal_goals', 'portal_tasks']);
	});

	it('hands each project its own goals and tasks', async () => {
		const projects = await withProjectWork(fakeSupabase([]), [{ id: 'project-1' }, { id: 'project-2' }]);
		expect(projects[0].goals).toEqual([rowsBySurface.portal_goals[0]]);
		expect(projects[0].tasks).toEqual(rowsBySurface.portal_tasks);
		expect(projects[1].goals).toEqual([rowsBySurface.portal_goals[1]]);
		expect(projects[1].tasks).toEqual([]);
	});

	it('still reads the goals before migration 0171 adds the context each came from', async () => {
		const projects = await withProjectWork(fakeSupabase([], false), [{ id: 'project-1' }]);
		expect(projects[0].goals).toEqual([rowsBySurface.portal_goals[0]]);
	});

	it('reads nothing when the contact reaches no project', async () => {
		const surfacesRead: string[] = [];
		expect(await withProjectWork(fakeSupabase(surfacesRead), [])).toEqual([]);
		expect(surfacesRead).toEqual([]);
	});
});
