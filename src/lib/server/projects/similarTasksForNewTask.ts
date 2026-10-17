import { fail, type ActionFailure } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserStory } from '$lib/data/userStoryRule';
import {
	raiseAnywayFieldName,
	raiseAnywayFormValue,
	similarTasksFoundMessage,
	type SimilarTask
} from '$lib/data/similarTasks';
import type { NewTaskSeed } from './createTask';
import { findSimilarTasks } from './findSimilarTasks';
import { getReachableProjectIds } from './getReachableProjectIds';

const refusedStatus = 400;

/** The words a new task is compared by: its title and what its story wants. */
export function newTaskText(title: string, story: UserStory | undefined): string {
	return `${title} ${story?.want ?? ''}`;
}

/** A subtask is a step of its own parent, and a task the person chose to raise anyway is not checked again. */
export function isSimilarCheckSkipped(seed: NewTaskSeed, isRaisedAnyway: boolean): boolean {
	return isRaisedAnyway || seed.parentTaskId !== null;
}

export async function similarTasksForNewTask(
	supabase: SupabaseClient,
	accountId: string,
	seed: NewTaskSeed,
	formData: FormData
): Promise<SimilarTask[]> {
	const isRaisedAnyway = formData.get(raiseAnywayFieldName) === raiseAnywayFormValue;
	if (isSimilarCheckSkipped(seed, isRaisedAnyway)) return [];
	const projectIds = await getReachableProjectIds(supabase, accountId);
	return findSimilarTasks(supabase, projectIds, newTaskText(seed.title, seed.story));
}

/** The form's refusal when open tasks across YBT look like the new one, carrying them to show; null when none do. */
export async function similarTasksFailure(
	supabase: SupabaseClient,
	accountId: string,
	seed: NewTaskSeed,
	formData: FormData
): Promise<ActionFailure<{ message: string; similarTasks: SimilarTask[] }> | null> {
	const similarTasks = await similarTasksForNewTask(supabase, accountId, seed, formData);
	if (similarTasks.length === 0) return null;
	return fail(refusedStatus, { message: similarTasksFoundMessage, similarTasks });
}
