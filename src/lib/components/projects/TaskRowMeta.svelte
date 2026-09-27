<script lang="ts">
	import TaskDueDate from './TaskDueDate.svelte';
	import TaskGoalButton from './TaskGoalButton.svelte';
	import TaskMetaBadges from './TaskMetaBadges.svelte';
	import TurnPill from '$lib/components/conversations/TurnPill.svelte';
	import type { TaskTurn } from './taskRowActions';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let {
		task,
		assigneeNames,
		goalTitle,
		isDone,
		turn,
		onChangeGoal
	}: {
		task: ProjectTask;
		assigneeNames: string[];
		goalTitle: string | null;
		isDone: boolean;
		turn: TaskTurn | null;
		onChangeGoal: () => void;
	} = $props();

	const assigneeLine = $derived(assigneeNames.join(', '));
</script>

<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
	{#if turn !== null && !isDone}
		<TurnPill {turn} />
	{/if}
	<TaskGoalButton {goalTitle} onOpenPicker={onChangeGoal} />
	<TaskMetaBadges {task} />
	{#if task.dueDate !== null}
		<TaskDueDate dueDate={task.dueDate} {isDone} />
	{/if}
	{#if assigneeLine !== ''}
		<span class="truncate text-xs text-chalk/50">{assigneeLine}</span>
	{/if}
</div>
