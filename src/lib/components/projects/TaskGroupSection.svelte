<script lang="ts">
	import TaskGroupHeader from './TaskGroupHeader.svelte';
	import TaskListRow from './TaskListRow.svelte';
	import { countTasksInTree } from './taskTreeCounts';
	import { openRows } from '$lib/client/openRows.svelte';
	import type { ListReorder } from '$lib/client/listReorder.svelte';
	import type { TaskGroup } from './taskTreeGroups';
	import type { TaskRowActions } from './taskRowActions';

	let {
		group,
		projectId,
		listReorder,
		actions
	}: {
		group: TaskGroup;
		projectId: string;
		listReorder: ListReorder;
		actions: TaskRowActions;
	} = $props();

	const openRowKey = $derived(group.goal?.id ?? `no-goal-${projectId}`);
	const isOpen = $derived(openRows.isOpen(openRowKey));
	const taskCount = $derived(countTasksInTree(group.tasks));
	const taskCountLabel = $derived(taskCount === 1 ? '1 task' : `${taskCount} tasks`);
	const panelId = $derived(`task-group-${group.goal?.id ?? 'other'}`);
</script>

<section class="overflow-hidden rounded-2xl border border-hairline bg-carriage/40">
	<TaskGroupHeader
		goal={group.goal}
		{projectId}
		{taskCountLabel}
		{isOpen}
		{panelId}
		onToggle={() => openRows.toggle(openRowKey)}
	/>
	{#if isOpen}
		<ol id={panelId} class="flex flex-col divide-y divide-hairline">
			{#each group.tasks as task, taskIndex (task.id)}
				<TaskListRow
					{task}
					numberPath={`${task.priority}`}
					isFirst={taskIndex === 0}
					isLast={taskIndex === group.tasks.length - 1}
					{listReorder}
					{actions}
				/>
			{/each}
		</ol>
	{/if}
</section>
