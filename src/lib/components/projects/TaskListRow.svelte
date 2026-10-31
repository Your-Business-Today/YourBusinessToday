<script lang="ts">
	import SubtaskRows from './SubtaskRows.svelte';
	import TaskCardHandle from './TaskCardHandle.svelte';
	import TaskCardFacts from './TaskCardFacts.svelte';
	import TaskCardActions from './TaskCardActions.svelte';
	import TaskCardFooter from './TaskCardFooter.svelte';
	import TaskRowTitle from './TaskRowTitle.svelte';
	import { isTaskDone } from '$lib/data/taskStatus';
	import { openRows } from '$lib/client/openRows.svelte';
	import type { TaskRowActions } from './taskRowActions';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let {
		task,
		numberPath,
		isFirst,
		isLast,
		actions
	}: {
		task: TaskTreeNode;
		numberPath: string;
		isFirst: boolean;
		isLast: boolean;
		actions: TaskRowActions;
	} = $props();

	const isDone = $derived(isTaskDone(task.status));
	const subtasks = $derived(task.subtasks);
	const hasSubtasks = $derived(subtasks.length > 0);
	const isOpen = $derived(hasSubtasks && openRows.isOpen(task.id));
	const subtaskPanelId = $derived(`subtasks-${task.id}`);
</script>

<article
	class="group/task flex flex-col gap-3 rounded-xl border border-hairline bg-carriage/70 p-3
		transition hover:border-chalk/25 sm:p-4"
	class:opacity-50={isDone}
>
	<div class="flex flex-wrap items-start gap-2 sm:flex-nowrap">
		<TaskCardHandle
			taskId={task.id}
			taskTitle={task.title}
			{numberPath}
			{isFirst}
			{isLast}
			onSetPriority={() => actions.onSetPriority(task)}
		/>
		<TaskRowTitle {task} {isOpen} panelId={subtaskPanelId} onToggle={() => openRows.toggle(task.id)} />
		<TaskCardActions {task} {actions} />
	</div>
	<TaskCardFacts
		{isDone}
		assignees={actions.assigneesFor(task.id)}
		turn={actions.turnFor(task.id)}
		standing={actions.standingFor(task.id)}
	/>
	<TaskCardFooter
		{task}
		{isDone}
		goalTitle={actions.goalTitleFor(task.goalId)}
		isAutocomplete={actions.isAutocomplete(task)}
		lifecycle={actions.lifecycleFor(task.id)}
		buildModel={actions.buildModelFor(task)}
	/>
</article>
{#if isOpen}
	<SubtaskRows parentTask={task} {numberPath} panelId={subtaskPanelId} {actions} />
{/if}
