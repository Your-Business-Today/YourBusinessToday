<script lang="ts">
	import TaskDueDate from './TaskDueDate.svelte';
	import TaskGoalButton from './TaskGoalButton.svelte';
	import TaskProgressMeter from './TaskProgressMeter.svelte';
	import TaskRaisedDate from './TaskRaisedDate.svelte';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let {
		task,
		isDone,
		goalTitle,
		onChangeGoal
	}: {
		task: ProjectTask;
		isDone: boolean;
		goalTitle: string | null;
		onChangeGoal: () => void;
	} = $props();

	const hasBranch = $derived(task.branchName !== '');
	const chipClasses = 'rounded-full border border-hairline px-2 py-0.5 font-display text-xs text-chalk/60';
</script>

<div
	class="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-hairline/70 pt-3 text-chalk/60"
>
	<TaskGoalButton {goalTitle} onOpenPicker={onChangeGoal} />
	<span title="Story points — how big the task is" class={`whitespace-nowrap ${chipClasses}`}>
		{task.storyPoints} pts
	</span>
	{#if hasBranch}
		<span title={`Worked on ${task.branchName}`} class={`max-w-40 truncate ${chipClasses}`}>
			⎇ {task.branchName}
		</span>
	{/if}
	<TaskProgressMeter completionPercent={task.completionPercent} />
	<span class="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1">
		{#if task.dueDate !== null}
			<TaskDueDate dueDate={task.dueDate} {isDone} isLabelled />
		{/if}
		<TaskRaisedDate createdAt={task.createdAt} />
	</span>
</div>
