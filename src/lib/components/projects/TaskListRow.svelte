<script lang="ts">
	import PriorityControls from './PriorityControls.svelte';
	import PriorityNumberButton from '$lib/components/site/PriorityNumberButton.svelte';
	import ReorderableRow from '$lib/components/site/ReorderableRow.svelte';
	import SubtaskRows from './SubtaskRows.svelte';
	import TaskFoldButton from './TaskFoldButton.svelte';
	import TaskRowControls from './TaskRowControls.svelte';
	import TaskRowMeta from './TaskRowMeta.svelte';
	import { isTaskDone } from '$lib/data/taskStatus';
	import { needsUserStory } from '$lib/data/userStoryRule';
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
	const titleWeight = $derived(task.parentTaskId === null ? 'font-medium' : 'text-sm');
	const hasSubtasks = $derived(task.subtasks.length > 0);
	const isOpen = $derived(hasSubtasks && openRows.isOpen(task.id));
	const subtaskPanelId = $derived(`subtasks-${task.id}`);
</script>

<ReorderableRow {listReorder} rowId={task.id} groupId={task.parentTaskId}>
	{#snippet children(dragHandle)}
		<div
			class="group/task flex items-start gap-2 px-3 py-3 transition hover:bg-carriage sm:px-4"
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
			<div class="flex min-w-0 flex-1 flex-col gap-1.5">
				<div class="flex min-w-0 items-center gap-1.5">
					<TaskFoldButton
						subtaskCount={task.subtasks.length}
						{isOpen}
						panelId={subtaskPanelId}
						onToggle={() => openRows.toggle(task.id)}
					/>
					<a
						href={`/projects/${task.projectId}/tasks/${task.id}`}
						class={`truncate font-display transition hover:text-go ${titleWeight}`}
					>
						{#if task.isUserStory}
							<span title="User story" class="text-caution">◆</span>
						{:else if needsUserStory(task)}
							<span title="No user story yet — edit the task to write one" class="text-chalk/30">◇</span>
						{/if}
						{task.title}
					</a>
				</div>
				<TaskRowMeta
					{task}
					{isDone}
					assignees={actions.assigneesFor(task.id)}
					goalTitle={actions.goalTitleFor(task.goalId)}
					turn={actions.turnFor(task.id)}
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
