import { fail, type ActionFailure } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserStory } from '$lib/data/userStoryRule';
import {
	comparedTaskTexts,
	raiseAnywayFieldName,
	raiseAnywayFormValue,
	similarTasksFoundMessage,
	type SimilarTask
} from '$lib/data/similarTasks';
import type { NewTaskSeed } from './createTask';
import { findSimilarTasks } from './findSimilarTasks';

const refusedStatus = 400;

/** The texts a new task is compared by: its title, and what its story wants when it has one. */
export function newTaskTexts(title: string, story: UserStory | undefined): string[] {
	return comparedTaskTexts(title, story?.want);
}

/** A subtask is a step of its own parent, and a task the person chose to raise anyway is not checked again. */
export function isSimilarCheckSkipped(seed: NewTaskSeed, isRaisedAnyway: boolean): boolean {
	return isRaisedAnyway || seed.parentTaskId !== null;
}

export async function similarTasksForNewTask(
	supabase: SupabaseClient,
	projectId: string,
	seed: NewTaskSeed,
	formData: FormData
): Promise<SimilarTask[]> {
	const isRaisedAnyway = formData.get(raiseAnywayFieldName) === raiseAnywayFormValue;
	if (isSimilarCheckSkipped(seed, isRaisedAnyway)) return [];
	return findSimilarTasks(supabase, projectId, newTaskTexts(seed.title, seed.story));
}

/** The form's refusal when open tasks on the project look like the new one, carrying them to show; null when none do. */
export async function similarTasksFailure(
	supabase: SupabaseClient,
	projectId: string,
	seed: NewTaskSeed,
	formData: FormData
): Promise<ActionFailure<{ message: string; similarTasks: SimilarTask[] }> | null> {
	const similarTasks = await similarTasksForNewTask(supabase, projectId, seed, formData);
	if (similarTasks.length === 0) return null;
	return fail(refusedStatus, { message: similarTasksFoundMessage, similarTasks });
}
