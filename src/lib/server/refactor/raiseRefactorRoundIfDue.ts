import type { SupabaseClient } from '@supabase/supabase-js';
import { countDeploysSinceRefactor } from '$lib/server/deploys/countDeploysSinceRefactor';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import { isRefactorRoundDue } from './isRefactorRoundDue';
import { nextRoundNumber, openRefactorRound } from './refactorRoundTitle';
import { raiseRefactorRound } from './raiseRefactorRound';
import type { Project } from '$lib/server/projects/projectRecord';

export type RoundOutcome = 'not_due' | 'raised';

/** Reads the cadence and raises the round when it is due; nothing is raised twice. */
export async function raiseRefactorRoundIfDue(
	supabase: SupabaseClient,
	project: Project
): Promise<RoundOutcome> {
	const deploysSinceRefactor = await countDeploysSinceRefactor(supabase, project);
	const tasks = await getTasksForProject(supabase, project.id);
	const reading = {
		refactorEveryDeploys: project.refactorEveryDeploys,
		deploysSinceRefactor,
		hasOpenRound: openRefactorRound(tasks) !== null
	};
	if (!isRefactorRoundDue(reading)) return 'not_due';
	await raiseRefactorRound(supabase, project, nextRoundNumber(tasks), deploysSinceRefactor);
	return 'raised';
}
