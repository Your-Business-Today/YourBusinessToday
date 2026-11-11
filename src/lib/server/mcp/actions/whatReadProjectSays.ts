import { buildTaskTree } from '$lib/server/projects/buildTaskTree';
import { countDeploysSinceRefactor } from '$lib/server/deploys/countDeploysSinceRefactor';
import { describeProject } from './describeProject';
import { describeInternalProject } from './describeInternalProject';
import { isInternalProject } from '$lib/data/internalProject';
import { describeScrumBoard } from './describeScrumBoard';
import { describeKitStanding, kitStanding } from '$lib/data/kitVersion';
import { kitReadingOf } from '$lib/server/kit/kitReadingOf';
import { describeRefactorCadence } from '$lib/server/refactor/isRefactorRoundDue';
import { describeDeployWindow } from '$lib/data/deployWindowFacts';
import { readDeployWindowHistory } from '$lib/server/deployWindows/readLatestDeployWindow';
import { ukClockAt } from '$lib/data/ukClock';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getLatestKitVersion } from '$lib/server/kit/kitVersions';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import { readBuildFacts } from '$lib/server/lifecycle/buildFacts';
import { readScrumBoard } from '$lib/server/scrumBoard/readScrumBoard';
import { readInternalItemFacts } from './readInternalItemFacts';
import type { Project } from '$lib/server/projects/projectRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * What read_project says of a project: the project and its backlog on both sides, then its development work by build stage.
 * An internal project gives its Internal work alone.
 */
export async function whatReadProjectSays(supabase: SupabaseClient, project: Project): Promise<string> {
	const tasks = await getTasksForProject(supabase, project.id);
	const goals = await getGoalsForProject(supabase, project.id);
	const facts = await readInternalItemFacts(supabase, project.id, tasks);
	const isInternal = isInternalProject(project, [...tasks, ...goals]);
	const backlog = buildTaskTree(tasks);
	if (isInternal) return describeInternalProject(project, goals, backlog, facts);
	const cadenceLine = await cadenceLineFor(supabase, project);
	const kitLine = await kitLineFor(supabase, project);
	const deployWindowLine = await deployWindowLineFor(supabase, project);
	const buildFacts = await readBuildFacts(supabase, project.id);
	const scrumBoard = await readScrumBoard(supabase, project.id, tasks, buildFacts);
	const description = describeProject(project, goals, backlog, `${cadenceLine} ${kitLine}${deployWindowLine}`, facts);
	return `${description}\n\n${describeScrumBoard(scrumBoard)}`;
}

async function cadenceLineFor(supabase: SupabaseClient, project: Project): Promise<string> {
	const deploysSinceRefactor = await countDeploysSinceRefactor(supabase, project);
	return describeRefactorCadence({ refactorEveryDeploys: project.refactorEveryDeploys, deploysSinceRefactor });
}

/** The deploy window sentence after the kit line, or nothing for a project that deploys on every merge. */
async function deployWindowLineFor(supabase: SupabaseClient, project: Project): Promise<string> {
	const history = await readDeployWindowHistory(supabase, project.id);
	const sentence = describeDeployWindow(project, history, ukClockAt(new Date()));
	return sentence === '' ? '' : ` ${sentence}`;
}

async function kitLineFor(supabase: SupabaseClient, project: Project): Promise<string> {
	const latestKitVersion = await getLatestKitVersion(supabase);
	const reading = kitReadingOf(project, latestKitVersion);
	return describeKitStanding(kitStanding(reading), reading);
}
