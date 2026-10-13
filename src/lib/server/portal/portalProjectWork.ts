import { PortalSurfaceColumns, PortalSurfaces, type PortalWorkSurface } from './portalSurfaces';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

const priorityColumn = 'priority';

/** Each project row with its goals and its tasks, read from the portal surfaces in priority order. */
export async function withProjectWork(supabase: SupabaseClient, projectRows: Row[]): Promise<Row[]> {
	if (projectRows.length === 0) return [];
	const projectIds = projectRows.map((row) => row.id as string);
	const [goals, tasks] = await Promise.all([
		readWork(supabase, PortalSurfaces.goals, PortalSurfaceColumns.goals, projectIds),
		readWork(supabase, PortalSurfaces.tasks, PortalSurfaceColumns.tasks, projectIds)
	]);
	return projectRows.map((row) => ({
		...row,
		goals: rowsOfProject(goals, row.id),
		tasks: rowsOfProject(tasks, row.id)
	}));
}

async function readWork(
	supabase: SupabaseClient,
	surface: PortalWorkSurface,
	columns: string,
	projectIds: string[]
): Promise<Row[]> {
	const { data, error } = await supabase
		.from(surface)
		.select<string, Row>(columns)
		.in('project_id', projectIds)
		.order(priorityColumn);
	if (error) throw error;
	return data;
}

function rowsOfProject(rows: Row[], projectId: unknown): Row[] {
	return rows.filter((row) => row.project_id === projectId);
}
