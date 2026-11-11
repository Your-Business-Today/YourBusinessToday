import type { SupabaseClient } from '@supabase/supabase-js';
import { shownLiveSince } from '$lib/data/buildStage';
import { getRecentDoneTimes } from './getRecentDoneTimes';
import { scrumBoardOf } from './scrumBoardOf';
import type { BuildFacts } from '$lib/server/lifecycle/buildFacts';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { ScrumBoard } from '$lib/data/scrumBoard';

/** The project's Development side as a scrum board, read with when its recently finished tasks were marked done. */
export async function readScrumBoard(
	supabase: SupabaseClient,
	projectId: string,
	projectTasks: ProjectTask[],
	build: BuildFacts
): Promise<ScrumBoard> {
	const now = new Date();
	const doneAtByTask = await getRecentDoneTimes(supabase, projectId, shownLiveSince(now));
	return scrumBoardOf({ ...build, projectTasks, doneAtByTask, now });
}
