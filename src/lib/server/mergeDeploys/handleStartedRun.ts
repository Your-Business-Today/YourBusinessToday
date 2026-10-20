import type { SupabaseClient } from '@supabase/supabase-js';
import { findProjectsByRepository } from '$lib/server/deploys/findProjectsByRepository';
import { isOnDefaultBranch } from '$lib/server/mainRuns/isOnDefaultBranch';
import type { StartedRun } from '$lib/server/mainRuns/readStartedRunEvent';
import { startCommitCheck } from './recordCommitCheck';

export type StartedRunOutcome = { kind: 'ignored' } | { kind: 'started'; projectIds: string[] };

/** A check GitHub started on the default branch is one its commit's task merge now waits for. */
export async function handleStartedRun(supabase: SupabaseClient, run: StartedRun | null): Promise<StartedRunOutcome> {
	if (run === null) return { kind: 'ignored' };
	const projects = await findProjectsByRepository(supabase, run.repositoryUrl);
	const onMain = projects.filter((project) => isOnDefaultBranch(run, project));
	const check = { commitSha: run.commitSha, checkName: run.checkName };
	for (const project of onMain) await startCommitCheck(supabase, project.id, check);
	return { kind: 'started', projectIds: onMain.map((project) => project.id) };
}
