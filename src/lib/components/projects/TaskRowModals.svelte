<script lang="ts">
	import PriorityModal from '$lib/components/site/PriorityModal.svelte';
	import TaskAutocompleteModal from './TaskAutocompleteModal.svelte';
	import TaskGoalModal from './TaskGoalModal.svelte';
	import TaskStatusModal from './TaskStatusModal.svelte';
	import TaskStoryPointsModal from './TaskStoryPointsModal.svelte';
	import { goalAutocomplete } from '$lib/data/autocomplete';
	import { taskPriorityScope } from '$lib/data/taskPriorityScope';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { TaskRowDialogs } from '$lib/client/taskRowDialogs.svelte';

	let { dialogs, goals }: { dialogs: TaskRowDialogs; goals: Goal[] } = $props();

	const { status, goal, priority, storyPoints, autocomplete } = $derived(dialogs);
	const statusTask = $derived(status.task);
	const goalTask = $derived(goal.task);
	const priorityTask = $derived(priority.task);
	const storyPointsTask = $derived(storyPoints.task);
	const autocompleteTask = $derived(autocomplete.task);
</script>

{#if statusTask !== null}
	<TaskStatusModal task={statusTask} bind:isOpen={status.isOpen} />
{/if}

{#if goalTask !== null}
	<TaskGoalModal
		taskId={goalTask.id}
		taskTitle={goalTask.title}
		currentGoalId={goalTask.goalId}
		{goals}
		bind:isOpen={goal.isOpen}
	/>
{/if}

{#if priorityTask !== null}
	<PriorityModal
		itemName={priorityTask.title}
		priority={priorityTask.priority}
		among={taskPriorityScope(priorityTask.parentTaskId)}
		action="?/setTaskPriority"
		fields={{ taskId: priorityTask.id }}
		bind:isOpen={priority.isOpen}
	/>
{/if}

{#if storyPointsTask !== null}
	<TaskStoryPointsModal task={storyPointsTask} bind:isOpen={storyPoints.isOpen} />
{/if}

{#if autocompleteTask !== null}
	<TaskAutocompleteModal
		task={autocompleteTask}
		goalSetting={goalAutocomplete(goals, autocompleteTask.goalId)}
		bind:isOpen={autocomplete.isOpen}
	/>
{/if}
