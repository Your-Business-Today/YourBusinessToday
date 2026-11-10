import { parseDevelopmentKind, titleForDevelopmentKind } from '$lib/data/developmentKind';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isStoryComplete, type UserStory } from '$lib/data/userStoryRule';
import { parseTaskKind, type TaskKind } from '$lib/data/taskKind';
import { nextQueueRank, nextSiblingRank } from '$lib/server/projects/nextRanks';
import type { AutocompleteSetting } from '$lib/data/autocomplete';
import { departmentColumns } from '$lib/server/departments/departmentColumns';
import { parseDepartment, type Department } from '$lib/data/department';

export type NewTaskSeed = {
	id?: string;
	title: string;
	details: string;
	dueDate: string | null;
	parentTaskId: string | null;
	waitsForTaskId: string | null;
	goalId: string | null;
	kind: TaskKind;
	story?: UserStory;
	requestedBy?: string;
	autocomplete?: AutocompleteSetting;
	department?: Department;
};

export function readNewTaskSeed(formData: FormData): NewTaskSeed | null {
	const typedTitle = String(formData.get('title') ?? '').trim();
	if (typedTitle === '') return null;
	const parentTaskId = emptyAsNull(String(formData.get('parentTaskId') ?? ''));
	const developmentKind = parentTaskId === null ? parseDevelopmentKind(formData.get('developmentKind')) : null;
	const title = titleForDevelopmentKind(typedTitle, developmentKind);
	return {
		title,
		details: String(formData.get('details') ?? '').trim(),
		dueDate: emptyAsNull(String(formData.get('dueDate') ?? '')),
		parentTaskId,
		waitsForTaskId: emptyAsNull(String(formData.get('waitsForTaskId') ?? '')),
		goalId: emptyAsNull(String(formData.get('goalId') ?? '')),
		kind: parseTaskKind(formData.get('kind')),
		department: parseDepartment(formData.get('department')) ?? undefined,
		story: {
			role: String(formData.get('storyRole') ?? '').trim(),
			want: String(formData.get('storyWant') ?? '').trim(),
			benefit: String(formData.get('storyBenefit') ?? '').trim()
		}
	};
}

export async function createTask(
	supabase: SupabaseClient,
	projectId: string,
	seed: NewTaskSeed,
	createdBy: string
): Promise<string> {
	const globalPriority =
		seed.parentTaskId === null ? await nextQueueRank(supabase, projectId) : null;
	const { data, error } = await supabase
		.from('tasks')
		.insert({
			project_id: projectId,
			parent_task_id: seed.parentTaskId,
			waits_for_task_id: seed.waitsForTaskId,
			goal_id: seed.goalId,
			kind: seed.kind,
			title: seed.title,
			details: seed.details,
			due_date: seed.dueDate,
			priority: await nextSiblingRank(supabase, projectId, seed.parentTaskId),
			global_priority: globalPriority,
			created_by: createdBy,
			...requestColumns(seed),
			...storyColumns(seed.story)
		})
		.select('id')
		.single();
	if (error) throw error;
	return data.id;
}

function requestColumns(seed: NewTaskSeed): Record<string, unknown> {
	const requester = { requested_by: seed.requestedBy ?? null, is_autocomplete: seed.autocomplete ?? null };
	const givenId = seed.id === undefined ? {} : { id: seed.id };
	return { ...givenId, ...requester, ...departmentColumns(seed.department) };
}

function storyColumns(story: UserStory | undefined): Record<string, unknown> {
	if (story === undefined || !isStoryComplete(story)) return {};
	return {
		is_user_story: true,
		story_role: story.role,
		story_want: story.want,
		story_benefit: story.benefit
	};
}

function emptyAsNull(value: string): string | null {
	if (value === '') return null;
	return value;
}
