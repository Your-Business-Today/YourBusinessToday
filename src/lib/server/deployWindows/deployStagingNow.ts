import type { SupabaseClient } from '@supabase/supabase-js';
import { deployByHand } from '$lib/data/deployStart';
import { ukClockAt } from '$lib/data/ukClock';
import { promoteStaging, type Promotion } from './promoteStaging';
import { recordManualDeploy } from './recordDeployWindow';
import type { Project } from '$lib/server/projects/projectRecord';

/** Promotes the project's staging branch at once, as the window would, and keeps the run as a deploy by hand. */
export async function deployStagingNow(supabase: SupabaseClient, project: Project, personName: string): Promise<Promotion> {
	const clock = ukClockAt(new Date());
	const promotion = await promoteStaging(project, clock, deployByHand(personName));
	await recordManualDeploy(supabase, project.id, clock.date, promotion);
	return promotion;
}
