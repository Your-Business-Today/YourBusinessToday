import type { SupabaseClient } from '@supabase/supabase-js';
import { deployWindowFacts, type DeployWindowFact } from '$lib/data/deployWindowFacts';
import { readLatestDeployWindow } from './readLatestDeployWindow';
import { ukClockAt } from '$lib/data/ukClock';
import type { Project } from '$lib/server/projects/projectRecord';

/** The project header's deploy window facts as of now: the next window, and what the last one did. */
export async function deployWindowFactsOf(supabase: SupabaseClient, project: Project): Promise<DeployWindowFact[]> {
	const lastWindow = await readLatestDeployWindow(supabase, project.id);
	return deployWindowFacts(project, lastWindow, ukClockAt(new Date()));
}
