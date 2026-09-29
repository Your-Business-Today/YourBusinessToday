<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import PriorityField from '$lib/components/site/PriorityField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import TaskGoalAndKindFields from './TaskGoalAndKindFields.svelte';
	import TaskMoveFields from './TaskMoveFields.svelte';
	import TaskPlanningFields from './TaskPlanningFields.svelte';
	import TeamPickerFieldset from './TeamPickerFieldset.svelte';
	import UserStoryFields from './UserStoryFields.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { taskStatusLabels, type TaskStatus } from '$lib/data/taskStatus';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import { taskPriorityScope } from '$lib/data/taskPriorityScope';
	import type { ProjectChoice } from '$lib/server/projects/getOtherProjects';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let {
		task,
		parentTask,
		siblingTasks,
		people,
		goals,
		assigneeIds,
		roles,
		otherProjects,
		onSaved
	}: {
		task: ProjectTask;
		parentTask: ProjectTask | null;
		siblingTasks: ProjectTask[];
		people: ProjectPerson[];
		goals: Goal[];
		assigneeIds: string[];
		roles: string[];
		otherProjects: ProjectChoice[];
		onSaved: () => void;
	} = $props();

	const tracker = new FormTracker();

	const priorityScope = $derived(taskPriorityScope(parentTask?.id ?? null));
	const statusOptions = Object.entries(taskStatusLabels) as [TaskStatus, string][];
	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<form
	method="POST"
	action="?/saveTask"
	use:enhance={tracker.submit(onSaved)}
	class="flex flex-col gap-4"
>
	<label class="flex flex-col gap-1">
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Title</span>
		<input name="title" required value={task.title} class={fieldClasses} />
	</label>
	<label class="flex flex-col gap-1">
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Details</span>
		<textarea
			name="details"
			rows="4"
			placeholder="Context, links — anything Claude or the team needs"
			class={fieldClasses}>{task.details}</textarea>
	</label>
	<div class="grid gap-4 sm:grid-cols-2">
		<label class="flex flex-col gap-1">
			<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Status</span>
			<select name="status" value={task.status} class={fieldClasses}>
				{#each statusOptions as [statusValue, statusLabel] (statusValue)}
					<option value={statusValue}>{statusLabel}</option>
				{/each}
			</select>
		</label>
		<label class="flex flex-col gap-1">
			<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Due date</span>
			<input name="dueDate" type="date" value={task.dueDate ?? ''} class={fieldClasses} />
		</label>
	</div>
	<TaskPlanningFields {task} />
	<PriorityField priority={task.priority} among={priorityScope} />
	<TaskGoalAndKindFields {goals} goalId={task.goalId} kind={task.kind} />
	<TaskMoveFields {parentTask} {siblingTasks} {otherProjects} />
	<UserStoryFields {task} />
	<TeamPickerFieldset {people} {assigneeIds} {roles} />
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		Save
	</SubmitButton>
</form>
