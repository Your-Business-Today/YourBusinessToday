<script lang="ts">
	import AssigneePills from './AssigneePills.svelte';
	import TaskDueDate from './TaskDueDate.svelte';
	import TaskGoalButton from './TaskGoalButton.svelte';
	import TaskMetaBadges from './TaskMetaBadges.svelte';
	import TurnPill from '$lib/components/conversations/TurnPill.svelte';
	import WaitsForPill from '$lib/components/sequences/WaitsForPill.svelte';
	import type { SequenceStanding } from '$lib/data/taskSequenceStanding';
	import type { TaskAssignee, TaskTurn } from './taskRowActions';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let {
		task,
		assignees,
		goalTitle,
		isDone,
		turn,
		standing,
		onChangeGoal
	}: {
		task: ProjectTask;
		assignees: TaskAssignee[];
		goalTitle: string | null;
		isDone: boolean;
		turn: TaskTurn | null;
		standing: SequenceStanding | null;
		onChangeGoal: () => void;
	} = $props();
</script>

<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
	{#if turn !== null && !isDone}
		<TurnPill {turn} />
	{/if}
	<WaitsForPill {standing} />
	<TaskGoalButton {goalTitle} onOpenPicker={onChangeGoal} />
	<TaskMetaBadges {task} />
	{#if task.dueDate !== null}
		<TaskDueDate dueDate={task.dueDate} {isDone} />
	{/if}
	<AssigneePills {assignees} />
</div>
