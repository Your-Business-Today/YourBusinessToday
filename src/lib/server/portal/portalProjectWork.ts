import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { PortalSurfaceColumns, PortalSurfaces, type PortalWorkSurface } from './portalSurfaces';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

const priorityColumn = 'priority';

/** Each project row with its goals and its tasks, read from the portal surfaces in priority order. */
export async function withProjectWork(supabase: SupabaseClient, projectRows: Row[]): Promise<Row[]> {
	if (projectRows.length === 0) return [];
	const projectIds = projectRows.map((row) => row.id as string);
	const [goals, tasks] = await Promise.all([
		readGoals(supabase, projectIds),
		readWork(supabase, PortalSurfaces.tasks, PortalSurfaceColumns.tasks, projectIds)
	]);
	return projectRows.map((row) => ({
		...row,
		goals: rowsOfProject(goals, row.id),
		tasks: rowsOfProject(tasks, row.id)
	}));
}

/** The goals with the confirmed context each came from; before migration 0171, the goals alone. */
async function readGoals(supabase: SupabaseClient, projectIds: string[]): Promise<Row[]> {
	const surface = PortalSurfaces.goals;
	try {
		return await readWork(supabase, surface, PortalSurfaceColumns.goalContexts, projectIds);
	} catch (failure) {
		if (!isSchemaNotYetMigrated(failure)) throw failure;
		return readWork(supabase, surface, PortalSurfaceColumns.goals, projectIds);
	}
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
