import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { checkStates, type CheckState, type CommitCheck } from './commitCheck';

export type RecordedCheck = { isRecorded: false } | { isRecorded: true; previousState: CheckState | null };

const notYetMigrated: RecordedCheck = { isRecorded: false };

/** Keeps how a check ended on its commit, and says how it stood before; nothing until its migration runs. */
export async function recordCommitCheck(
	supabase: SupabaseClient,
	projectId: string,
	check: CommitCheck
): Promise<RecordedCheck> {
	const { data, error } = await supabase
		.from('commit_checks')
		.select('state')
		.match({ project_id: projectId, commit_sha: check.commitSha, check_name: check.checkName })
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return notYetMigrated;
	if (error) throw error;
	await saveCommitCheck(supabase, projectId, check, false);
	return { isRecorded: true, previousState: (data?.state as CheckState) ?? null };
}

/** Notes a check GitHub has started on a commit, leaving alone one that has already ended. */
export async function startCommitCheck(
	supabase: SupabaseClient,
	projectId: string,
	check: Omit<CommitCheck, 'state' | 'runUrl'>
): Promise<void> {
	await saveCommitCheck(supabase, projectId, { ...check, state: checkStates.running, runUrl: '' }, true);
}

async function saveCommitCheck(
	supabase: SupabaseClient,
	projectId: string,
	check: CommitCheck,
	isKeptWhenThere: boolean
): Promise<void> {
	const { error } = await supabase.from('commit_checks').upsert(
		{
			project_id: projectId,
			commit_sha: check.commitSha,
			check_name: check.checkName,
			state: check.state,
			run_url: check.runUrl,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'project_id,commit_sha,check_name', ignoreDuplicates: isKeptWhenThere }
	);
	if (isSchemaNotYetMigrated(error)) return;
	if (error) throw error;
}
