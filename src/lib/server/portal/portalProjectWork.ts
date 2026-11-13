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

/** The goals with the confirmed workflow map each came from; before migration 0213, without it. */
async function readGoals(supabase: SupabaseClient, projectIds: string[]): Promise<Row[]> {
	const columnsNewestFirst = [PortalSurfaceColumns.goalOrigins, PortalSurfaceColumns.goals];
	const [newest, ...older] = columnsNewestFirst;
	return readGoalsWith(supabase, projectIds, newest, older);
}

async function readGoalsWith(supabase: SupabaseClient, projectIds: string[], columns: string, older: string[]): Promise<Row[]> {
	try {
		return await readWork(supabase, PortalSurfaces.goals, columns, projectIds);
	} catch (failure) {
		const [nextColumns, ...rest] = older;
		if (!isSchemaNotYetMigrated(failure) || nextColumns === undefined) throw failure;
		return readGoalsWith(supabase, projectIds, nextColumns, rest);
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
