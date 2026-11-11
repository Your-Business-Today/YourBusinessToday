import { describe, expect, it } from 'vitest';
import { findInternalProjectIds } from './findInternalProjectIds';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = { project_id: string; department: string };

/** A database holding these rows, answering the one read the finder makes of each table. */
function databaseHolding(rowsByTable: Record<string, Row[]>) {
	const askedProjectIds: string[] = [];
	const supabase = {
		from(table: string) {
			const filters: { projectId?: string; departments: string[] } = { departments: [] };
			const isAsked = (row: Row) => row.project_id === filters.projectId && filters.departments.includes(row.department);
			const query = {
				select: () => query,
				eq(_column: string, projectId: string) {
					filters.projectId = projectId;
					askedProjectIds.push(projectId);
					return query;
				},
				in(_column: string, departments: string[]) {
					filters.departments = departments;
					return query;
				},
				limit: async () => ({ data: (rowsByTable[table] ?? []).filter(isAsked), error: null })
			};
			return query;
		}
	};
	return { supabase: supabase as unknown as SupabaseClient, askedProjectIds };
}

describe('findInternalProjectIds', () => {
	const projects = [
		{ id: 'office-move', repositoryUrl: '' },
		{ id: 'dog-tinder', repositoryUrl: '' },
		{ id: 'hosting-only', repositoryUrl: '' },
		{ id: 'ybt', repositoryUrl: 'https://github.com/owner/ybt' }
	];

	it('marks the projects with no repository and no development work, and asks nothing of one with a repository', async () => {
		const { supabase, askedProjectIds } = databaseHolding({
			tasks: [
				{ project_id: 'office-move', department: 'administration' },
				{ project_id: 'dog-tinder', department: 'development' }
			],
			goals: [{ project_id: 'hosting-only', department: 'infrastructure' }]
		});
		const internalIds = await findInternalProjectIds(supabase, projects);
		expect([...internalIds]).toEqual(['office-move']);
		expect(askedProjectIds).not.toContain('ybt');
	});
});
