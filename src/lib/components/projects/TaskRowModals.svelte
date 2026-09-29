<script lang="ts">
	import PriorityModal from '$lib/components/site/PriorityModal.svelte';
	import TaskGoalModal from './TaskGoalModal.svelte';
	import TaskStatusModal from './TaskStatusModal.svelte';
	import { taskPriorityScope } from '$lib/data/taskPriorityScope';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let {
		statusTask,
		goalTask,
		priorityTask,
		goals,
		isStatusModalOpen = $bindable(),
		isGoalModalOpen = $bindable(),
		isPriorityModalOpen = $bindable()
	}: {
		statusTask: TaskTreeNode | null;
		goalTask: TaskTreeNode | null;
		priorityTask: TaskTreeNode | null;
		goals: Goal[];
		isStatusModalOpen: boolean;
		isGoalModalOpen: boolean;
		isPriorityModalOpen: boolean;
	} = $props();
</script>

{#if statusTask !== null}
	<TaskStatusModal task={statusTask} bind:isOpen={isStatusModalOpen} />
{/if}

{#if goalTask !== null}
	<TaskGoalModal
		taskId={goalTask.id}
		taskTitle={goalTask.title}
		currentGoalId={goalTask.goalId}
		{goals}
		bind:isOpen={isGoalModalOpen}
	/>
{/if}

{#if priorityTask !== null}
	<PriorityModal
		itemName={priorityTask.title}
		priority={priorityTask.priority}
		among={taskPriorityScope(priorityTask.parentTaskId)}
		action="?/setTaskPriority"
		fields={{ taskId: priorityTask.id }}
		bind:isOpen={isPriorityModalOpen}
	/>
{/if}
