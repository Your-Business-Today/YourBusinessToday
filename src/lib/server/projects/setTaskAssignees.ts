import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

/**
 * Makes the task's assignees exactly the people given. Only the people joining are written and
 * only the people leaving are removed, so someone already on the task is not told again that it
 * is theirs. assignedBy names who made the change when the door has no signed-in session (the
 * connector); the site's own doors leave it out and the database reads the session instead.
 */
export async function setTaskAssignees(
	supabase: SupabaseClient,
	taskId: string,
	profileIds: string[],
	assignedBy: string | null = null
): Promise<void> {
	const currentIds = await getCurrentAssigneeIds(supabase, taskId);
	const leavingIds = currentIds.filter((currentId) => !profileIds.includes(currentId));
	const joiningIds = profileIds.filter((profileId) => !currentIds.includes(profileId));
	await removeAssignees(supabase, taskId, leavingIds);
	await addAssignees(supabase, taskId, joiningIds, assignedBy);
}

/** Puts the people given on the task beside whoever is already on it. */
export async function addTaskAssignees(
	supabase: SupabaseClient,
	taskId: string,
	profileIds: string[],
	assignedBy: string | null = null
): Promise<void> {
	const currentIds = await getCurrentAssigneeIds(supabase, taskId);
	const joiningIds = profileIds.filter((profileId) => !currentIds.includes(profileId));
	await addAssignees(supabase, taskId, joiningIds, assignedBy);
}

export async function getCurrentAssigneeIds(supabase: SupabaseClient, taskId: string): Promise<string[]> {
	const { data, error } = await supabase.from('task_assignees').select('profile_id').eq('task_id', taskId);
	if (error) throw error;
	return data.map((row) => String(row.profile_id));
}

async function removeAssignees(supabase: SupabaseClient, taskId: string, leavingIds: string[]): Promise<void> {
	if (leavingIds.length === 0) return;
	const { error } = await supabase
		.from('task_assignees')
		.delete()
		.eq('task_id', taskId)
		.in('profile_id', leavingIds);
	if (error) throw error;
}

async function addAssignees(
	supabase: SupabaseClient,
	taskId: string,
	joiningIds: string[],
	assignedBy: string | null
): Promise<void> {
	if (joiningIds.length === 0) return;
	const rows = joiningIds.map((profileId) => ({ task_id: taskId, profile_id: profileId }));
	if (assignedBy === null) return insertAssigneeRows(supabase, rows);
	const signedRows = rows.map((row) => ({ ...row, assigned_by: assignedBy }));
	const { error } = await supabase.from('task_assignees').insert(signedRows);
	if (error === null) return;
	if (!isSchemaNotYetMigrated(error)) throw error;
	await insertAssigneeRows(supabase, rows);
}

async function insertAssigneeRows(supabase: SupabaseClient, rows: Record<string, string>[]): Promise<void> {
	const { error } = await supabase.from('task_assignees').insert(rows);
	if (error) throw error;
}
