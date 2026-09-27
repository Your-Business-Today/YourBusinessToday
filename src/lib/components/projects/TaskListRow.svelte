<script lang="ts">
	import PriorityControls from './PriorityControls.svelte';
	import ReorderableRow from '$lib/components/site/ReorderableRow.svelte';
	import TaskListRow from './TaskListRow.svelte';
	import TaskRowControls from './TaskRowControls.svelte';
	import TaskRowMeta from './TaskRowMeta.svelte';
	import { isTaskDone } from '$lib/data/taskStatus';
	import { needsUserStory } from '$lib/data/userStoryRule';
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
				<span class="w-8 text-right font-display text-xs tabular-nums text-chalk/40">
					{numberPath}
				</span>
			</div>
			<div class="flex min-w-0 flex-1 flex-col gap-1.5">
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
				<TaskRowMeta
					{task}
					{isDone}
					assigneeNames={actions.assigneeNamesFor(task.id)}
					goalTitle={actions.goalTitleFor(task.goalId)}
					turn={actions.turnFor(task.id)}
					onChangeGoal={() => actions.onChangeGoal(task)}
				/>
			</div>
			<TaskRowControls {task} {actions} />
		</div>
		{#if task.subtasks.length > 0}
			<ol class="ml-7 flex flex-col border-l border-hairline sm:ml-12">
				{#each task.subtasks as subtask, subtaskIndex (subtask.id)}
					<TaskListRow
						task={subtask}
						numberPath={`${numberPath}.${subtask.priority}`}
						isFirst={subtaskIndex === 0}
						isLast={subtaskIndex === task.subtasks.length - 1}
						{listReorder}
						{actions}
					/>
				{/each}
			</ol>
		{/if}
	{/snippet}
</ReorderableRow>
