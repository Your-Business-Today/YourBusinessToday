import type { SupabaseClient } from '@supabase/supabase-js';
import { createTask } from '$lib/server/projects/createTask';
import { markRefactorRoundRaised } from './markRefactorRoundRaised';
import { postMessage } from '$lib/server/conversations/postMessage';
import { refactorRoundBrief, refactorRoundRaisedSentence, refactorRoundStoryPoints } from './refactorRoundBrief';
import { refactorRoundTitle } from './refactorRoundTitle';
import { setTaskStoryPoints } from '$lib/server/projects/setTaskStoryPoints';
import type { Project } from '$lib/server/projects/projectRecord';

/** Raises "REFACTOR: round N" on the project, in the owner's name, as the reminder that a round is due. */
export async function raiseRefactorRound(
	supabase: SupabaseClient,
	project: Project,
	roundNumber: number,
	deploysSince: number
): Promise<string> {
	const taskId = await createTask(
		supabase,
		project.id,
		{
			title: refactorRoundTitle(roundNumber),
			details: refactorRoundBrief,
			dueDate: null,
			parentTaskId: null,
			goalId: null,
			kind: 'work'
		},
		project.ownerId
	);
	await setTaskStoryPoints(supabase, taskId, refactorRoundStoryPoints);
	await markRefactorRoundRaised(supabase, project.id, new Date());
	await postMessage(
		supabase,
		{ taskId },
		project.ownerId,
		refactorRoundRaisedSentence(deploysSince, project.defaultBranch)
	);
	return taskId;
}
