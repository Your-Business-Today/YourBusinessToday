import type { SupabaseClient } from '@supabase/supabase-js';
import { deployWindowFacts, type DeployWindowFact } from '$lib/data/deployWindowFacts';
import { readDeployWindowHistory } from './readLatestDeployWindow';
import { ukClockAt } from '$lib/data/ukClock';
import type { Project } from '$lib/server/projects/projectRecord';

/** The project header's deploy facts as of now: the next window, and what the last promotion did. */
export async function deployWindowFactsOf(supabase: SupabaseClient, project: Project): Promise<DeployWindowFact[]> {
	const history = await readDeployWindowHistory(supabase, project.id);
	return deployWindowFacts(project, history, ukClockAt(new Date()));
}
