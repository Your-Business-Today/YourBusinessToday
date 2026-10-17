import type { SupabaseClient } from '@supabase/supabase-js';
import { awaitingKinds, type PostedVia } from '$lib/data/conversationTurn';
import { similarTaskReviewQuestion } from '$lib/data/similarTaskReview';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { postMessage } from '$lib/server/conversations/postMessage';
import type { UserStory } from '$lib/data/userStoryRule';
import { findSimilarTasks, type SimilarTask } from './findSimilarTasks';
import { newTaskText } from './similarTasksForNewTask';

/** A top level task its raiser chose to raise anyway, though open tasks looked like it. */
export type RaisedAnyway = {
	taskId: string;
	title: string;
	projectName: string;
	parentTaskId: string | null;
	story?: UserStory;
};

export type Raiser = { accountId: string; postedVia: PostedVia };

/** Ask the raiser of each open task that looks like the one raised anyway whether to keep both, merge or replace theirs. */
export async function askSimilarTaskRaisers(
	supabase: SupabaseClient,
	projectIds: string[],
	raiser: Raiser,
	raised: RaisedAnyway
): Promise<void> {
	if (raised.parentTaskId !== null) return;
	const found = await findSimilarTasks(supabase, projectIds, newTaskText(raised.title, raised.story));
	const others = found.filter((task) => isSomeoneElsesTask(task, raiser, raised));
	if (others.length === 0) return;
	const [account] = await getAccountsById(supabase, [raiser.accountId]);
	const raiserName = account?.name ?? 'Someone';
	for (const task of others) await askOneRaiser(supabase, raiser, raiserName, raised, task);
}

/** Only someone else's open task, other than the one just raised, is reviewed. */
export function isSomeoneElsesTask(task: SimilarTask, raiser: Raiser, raised: RaisedAnyway): boolean {
	const hasRaiser = task.raisedById !== '';
	return hasRaiser && task.raisedById !== raiser.accountId && task.taskId !== raised.taskId;
}

async function askOneRaiser(
	supabase: SupabaseClient,
	raiser: Raiser,
	raiserName: string,
	raised: RaisedAnyway,
	task: SimilarTask
): Promise<void> {
	const reviewId = await insertReview(supabase, raiser.accountId, raised, task);
	const question = similarTaskReviewQuestion(raised.title, raised.projectName, raiserName);
	const awaiting = { accountId: task.raisedById, kind: awaitingKinds.person };
	const body = `${question} (review id: ${reviewId})`;
	await postMessage(supabase, { taskId: task.taskId }, raiser.accountId, body, { postedVia: raiser.postedVia, awaiting });
}

async function insertReview(
	supabase: SupabaseClient,
	raisedBy: string,
	raised: RaisedAnyway,
	task: SimilarTask
): Promise<string> {
	const { data, error } = await supabase
		.from('similar_task_reviews')
		.insert({
			existing_task_id: task.taskId,
			new_task_id: raised.taskId,
			new_task_title: raised.title,
			new_project_name: raised.projectName,
			reviewer_account_id: task.raisedById,
			raised_by: raisedBy
		})
		.select('id')
		.single();
	if (error) throw error;
	return data.id;
}
