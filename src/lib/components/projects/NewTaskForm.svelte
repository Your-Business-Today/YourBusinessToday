<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import NewTaskDetailsField from './NewTaskDetailsField.svelte';
	import NewTaskDueDateField from './NewTaskDueDateField.svelte';
	import NewTaskFormShell from './NewTaskFormShell.svelte';
	import NewTaskStoryFields from './NewTaskStoryFields.svelte';
	import TaskGoalAndKindFields from './TaskGoalAndKindFields.svelte';
	import TaskSequenceField from '$lib/components/sequences/TaskSequenceField.svelte';
	import { needsUserStory } from '$lib/data/userStoryRule';
	import type { TaskKind } from '$lib/data/taskKind';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
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

	let title = $state('');
	let kind = $state<TaskKind>('work');

	const titleHint = $derived(newTaskTitle(title, parentTaskId, developmentKind));
	const isStoryRequired = $derived(needsUserStory({ kind, title: titleHint.raisedTitle, parentTaskId }));
	const isSubtask = $derived(parentTaskId !== null);
	const laterNote = "Story points, assignees, and the rest are set on the task page after it's created.";
</script>

<NewTaskFormShell {createAction} {parentTaskId} {hiddenFields} {submitLabel} {laterNote} {onCreated}>
	<SmallCapsField label="Title">
		<input
			name="title"
			required
			bind:value={title}
			placeholder={titleHint.placeholder}
			class={fieldClasses}
		/>
	</SmallCapsField>
	<NewTaskDetailsField />
	<NewTaskDueDateField />
	{#if !isSubtask}
		<NewTaskStoryFields {isStoryRequired} />
	{/if}
	<TaskGoalAndKindFields {goals} {goalId} bind:kind />
	{#if sequenceChoices.length > 0}
		<TaskSequenceField waitsForTaskId={null} {sequenceChoices} />
	{/if}
</NewTaskFormShell>
