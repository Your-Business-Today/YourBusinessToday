<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import NewTaskDetailsField from './NewTaskDetailsField.svelte';
	import NewTaskDueDateField from './NewTaskDueDateField.svelte';
	import NewTaskFormShell from './NewTaskFormShell.svelte';
	import TaskGoalAndKindFields from './TaskGoalAndKindFields.svelte';
	import TaskOwnerField from './TaskOwnerField.svelte';
	import TaskSequenceField from '$lib/components/sequences/TaskSequenceField.svelte';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let {
		parentTaskId,
		goals,
		people,
		sequenceChoices,
		hiddenFields,
		onCreated
	}: {
		parentTaskId: string | null;
		goals: Goal[];
		people: ProjectPerson[];
		sequenceChoices: ProjectTask[];
		hiddenFields: Record<string, string>;
		onCreated: () => void;
	} = $props();

	const laterNote = 'Status, priority and the rest are set on the task page after it is added.';
</script>

<NewTaskFormShell
	createAction="?/createTask"
	{parentTaskId}
	{hiddenFields}
	submitLabel="Add task"
	{laterNote}
	{onCreated}
>
	<SmallCapsField label="Title">
		<input name="title" required placeholder="What needs doing" class={fieldClasses} />
	</SmallCapsField>
	<NewTaskDetailsField />
	<TaskOwnerField {people} />
	<NewTaskDueDateField />
	<TaskGoalAndKindFields {goals} shouldOfferKind={false} />
	{#if sequenceChoices.length > 0}
		<TaskSequenceField waitsForTaskId={null} {sequenceChoices} />
	{/if}
</NewTaskFormShell>
