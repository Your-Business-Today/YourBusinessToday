<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import { enhance } from '$app/forms';
	import NewTaskFormFooter from './NewTaskFormFooter.svelte';
	import NewTaskStoryFields from './NewTaskStoryFields.svelte';
	import TaskGoalAndKindFields from './TaskGoalAndKindFields.svelte';
	import TaskSequenceField from '$lib/components/sequences/TaskSequenceField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { needsUserStory } from '$lib/data/userStoryRule';
	import type { TaskKind } from '$lib/data/taskKind';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
	import { readSimilarTasks } from '$lib/data/similarTasks';
	import { newTaskTitle } from './newTaskTitle';
	import type { DevelopmentKind } from '$lib/data/developmentKind';

	let {
		createAction = '?/createTask',
		parentTaskId = null,
		goals = [],
		goalId = null,
		sequenceChoices = [],
		hiddenFields = {},
		submitLabel = 'Add task',
		developmentKind = null,
		onCreated
	}: {
		createAction?: string;
		parentTaskId?: string | null;
		goals?: Goal[];
		goalId?: string | null;
		sequenceChoices?: ProjectTask[];
		hiddenFields?: Record<string, string>;
		submitLabel?: string;
		developmentKind?: DevelopmentKind | null;
		onCreated: () => void;
	} = $props();

	const tracker = new FormTracker();

	let title = $state('');
	let kind = $state<TaskKind>('work');

	const titleHint = $derived(newTaskTitle(title, parentTaskId, developmentKind));
	const isStoryRequired = $derived(needsUserStory({ kind, title: titleHint.raisedTitle, parentTaskId }));
	const isSubtask = $derived(parentTaskId !== null);
	const similarTasks = $derived(readSimilarTasks(tracker.failureData));
</script>

<form
	method="POST"
	action={createAction}
	use:enhance={tracker.submit(onCreated)}
	class="flex flex-col gap-4"
>
	{#each Object.entries(hiddenFields) as [fieldName, fieldValue] (fieldName)}
		<input type="hidden" name={fieldName} value={fieldValue} />
	{/each}
	{#if parentTaskId !== null}
		<input type="hidden" name="parentTaskId" value={parentTaskId} />
	{/if}
	<SmallCapsField label="Title">
		<input
			name="title"
			required
			bind:value={title}
			placeholder={titleHint.placeholder}
			class={fieldClasses}
		/>
	</SmallCapsField>
	<SmallCapsField label="Details">
		<textarea
			name="details"
			rows="3"
			placeholder="Context, links, acceptance criteria (optional)"
			class={fieldClasses}
		></textarea>
	</SmallCapsField>
	<SmallCapsField label="Due date">
		<input name="dueDate" type="date" class={fieldClasses} />
	</SmallCapsField>
	{#if !isSubtask}
		<NewTaskStoryFields {isStoryRequired} />
	{/if}
	<TaskGoalAndKindFields {goals} {goalId} bind:kind />
	{#if sequenceChoices.length > 0}
		<TaskSequenceField waitsForTaskId={null} {sequenceChoices} />
	{/if}
	<NewTaskFormFooter
		errorMessage={tracker.errorMessage}
		{similarTasks}
		isSaving={tracker.isSaving}
		{submitLabel}
		onCancelSimilar={() => tracker.reset()}
	/>
</form>
