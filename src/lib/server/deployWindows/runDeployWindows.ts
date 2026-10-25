import type { SupabaseClient } from '@supabase/supabase-js';
import { isDeployWindowDue } from '$lib/data/deployWindowRule';
import { ukClockAt, type UkClock } from '$lib/data/ukClock';
import { deployWindowOutcomes } from '$lib/data/deployWindow';
import { findProjectsWithDeployWindow } from './findProjectsWithDeployWindow';
import { promoteStaging, type Promotion } from './promoteStaging';
import { readLatestTimedWindow } from './readLatestDeployWindow';
import { recordTimedWindow } from './recordDeployWindow';
import { timedWindowStart } from '$lib/data/deployStart';
import type { Project } from '$lib/server/projects/projectRecord';

export type DeployWindowRun = Promotion & { projectId: string; projectName: string };

/** Runs the window of every project whose deploy time has come today and has not run yet, and records each. */
export async function runDeployWindows(supabase: SupabaseClient, now: Date = new Date()): Promise<DeployWindowRun[]> {
	const clock = ukClockAt(now);
	const projects = await findProjectsWithDeployWindow(supabase);
	const runs: DeployWindowRun[] = [];
	for (const project of projects) {
		const run = await runWindowIfDue(supabase, project, clock);
		if (run !== null) runs.push(run);
	}
	return runs;
}

async function runWindowIfDue(supabase: SupabaseClient, project: Project, clock: UkClock): Promise<DeployWindowRun | null> {
	const lastWindow = await readLatestTimedWindow(supabase, project.id);
	const reading = {
		deployTime: project.deployStagingAt,
		clock,
		lastWindowDate: lastWindow?.windowDate ?? null,
		wasLastWindowFailed: lastWindow?.outcome === deployWindowOutcomes.failed
	};
	if (!isDeployWindowDue(reading)) return null;
	const promotion = await promoteStaging(project, clock, timedWindowStart);
	await recordTimedWindow(supabase, project.id, clock.date, promotion);
	return { projectId: project.id, projectName: project.name, ...promotion };
}
