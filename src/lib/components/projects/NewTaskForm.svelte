<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import NewTaskStoryFields from './NewTaskStoryFields.svelte';
	import TaskGoalAndKindFields from './TaskGoalAndKindFields.svelte';
	import TaskSequenceField from '$lib/components/sequences/TaskSequenceField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { bugFixTitlePrefix, needsUserStory } from '$lib/data/userStoryRule';
	import type { TaskKind } from '$lib/data/taskKind';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let {
		createAction = '?/createTask',
		parentTaskId = null,
		goals = [],
		goalId = null,
		sequenceChoices = [],
		hiddenFields = {},
		submitLabel = 'Add task',
		onCreated
	}: {
		createAction?: string;
		parentTaskId?: string | null;
		goals?: Goal[];
		goalId?: string | null;
		sequenceChoices?: ProjectTask[];
		hiddenFields?: Record<string, string>;
		submitLabel?: string;
		onCreated: () => void;
	} = $props();

	const tracker = new FormTracker();

	let title = $state('');
	let kind = $state<TaskKind>('work');

	const isStoryRequired = $derived(needsUserStory({ kind, title, parentTaskId }));
	const isSubtask = $derived(parentTaskId !== null);
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
			placeholder={isSubtask ? 'What needs doing' : `The story, or ${bugFixTitlePrefix} what is wrong`}
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
	<p class="text-xs text-chalk/50">
		Story points, assignees, and the rest are set on the task page after it's created.
	</p>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		savingLabel="Adding…"
		class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		{submitLabel}
	</SubmitButton>
</form>
