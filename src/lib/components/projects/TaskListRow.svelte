<script lang="ts">
	import PriorityControls from './PriorityControls.svelte';
	import PriorityNumberButton from '$lib/components/site/PriorityNumberButton.svelte';
	import ReorderableRow from '$lib/components/site/ReorderableRow.svelte';
	import SubtaskRows from './SubtaskRows.svelte';
	import TaskRowControls from './TaskRowControls.svelte';
	import TaskRowMeta from './TaskRowMeta.svelte';
	import TaskRowTitle from './TaskRowTitle.svelte';
	import { isTaskDone } from '$lib/data/taskStatus';
	import { openRows } from '$lib/client/openRows.svelte';
	import type { ListReorder } from '$lib/client/listReorder.svelte';
	import type { TaskRowActions } from './taskRowActions';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let {
		task,
		numberPath,
		isFirst,
		isLast,
		listReorder,
		actions
	}: {
		task: TaskTreeNode;
		numberPath: string;
		isFirst: boolean;
		isLast: boolean;
		listReorder: ListReorder;
		actions: TaskRowActions;
	} = $props();

	const isDone = $derived(isTaskDone(task.status));
	const subtasks = $derived(task.subtasks);
	const hasSubtasks = $derived(subtasks.length > 0);
	const isOpen = $derived(hasSubtasks && openRows.isOpen(task.id));
	const subtaskPanelId = $derived(`subtasks-${task.id}`);
</script>

<ReorderableRow {listReorder} rowId={task.id} groupId={task.parentTaskId}>
	{#snippet children(dragHandle)}
		<div
			class="group/task flex items-start gap-2 px-2 py-2 transition hover:bg-night/40 sm:px-3"
			class:opacity-50={isDone}
		>
			<div class="flex shrink-0 items-center gap-0.5 pt-0.5">
				{@render dragHandle()}
				<PriorityControls
					moveAction="?/moveTask"
					fieldName="taskId"
					id={task.id}
					{isFirst}
					{isLast}
				/>
				<PriorityNumberButton
					label={numberPath}
					itemName={task.title}
					class="w-8 text-right font-display text-xs tabular-nums text-chalk/40"
					onclick={() => actions.onSetPriority(task)}
				/>
			</div>
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<TaskRowTitle
					{task}
					{isOpen}
					panelId={subtaskPanelId}
					onToggle={() => openRows.toggle(task.id)}
				/>
				<TaskRowMeta
					{task}
					{isDone}
					assignees={actions.assigneesFor(task.id)}
					goalTitle={actions.goalTitleFor(task.goalId)}
					turn={actions.turnFor(task.id)}
					standing={actions.standingFor(task.id)}
					onChangeGoal={() => actions.onChangeGoal(task)}
				/>
			</div>
			<TaskRowControls {task} {actions} />
		</div>
		{#if isOpen}
			<SubtaskRows parentTask={task} {numberPath} panelId={subtaskPanelId} {listReorder} {actions} />
		{/if}
	{/snippet}
</ReorderableRow>
