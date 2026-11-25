import type { SupabaseClient } from '@supabase/supabase-js';
import { monthOfDay } from '$lib/data/books/monthKey';
import type { CostShareMember } from '$lib/data/books/sharing/costShare';
import { membersByStatus, type ProjectStatusChange } from '$lib/data/books/sharing/statusSpells';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

export const projectStatusChangesTable = 'project_status_changes';

type StatusChangeRow = { project_id: string; status: string; changed_month: string; is_starting_status: boolean };

/** A member for each spell each of the organisation's projects was live, read from the history of its status. */
export async function findLiveProjectMembers(supabase: SupabaseClient, organisationId: string): Promise<CostShareMember[]> {
	const { data, error } = await supabase
		.from(projectStatusChangesTable)
		.select('project_id, status, changed_month, is_starting_status')
		.eq('organisation_id', organisationId)
		.order('changed_at');
	if (error !== null && isSchemaNotYetMigrated(error)) return [];
	if (error !== null) throw error;
	return membersByStatus(historiesByProject(data as StatusChangeRow[]));
}

function historiesByProject(rows: StatusChangeRow[]): Map<string, ProjectStatusChange[]> {
	const histories = new Map<string, ProjectStatusChange[]>();
	for (const row of rows) {
		const change = { status: row.status, changedMonth: monthOfDay(row.changed_month), isStartingStatus: row.is_starting_status };
		histories.set(row.project_id, [...(histories.get(row.project_id) ?? []), change]);
	}
	return histories;
}
