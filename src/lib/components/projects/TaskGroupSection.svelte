<script lang="ts">
	import TaskGroupHeader from './TaskGroupHeader.svelte';
	import TaskListRow from './TaskListRow.svelte';
	import { countTasksInTree } from './taskTreeCounts';
	import { openRows } from '$lib/client/openRows.svelte';
	import type { ListReorder } from '$lib/client/listReorder.svelte';
	import { groupKeyOf, type TaskGroup } from './taskTreeGroups';
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

	const { goal, tasks } = $derived(group);
	const openRowKey = $derived(goal?.id ?? `no-goal-${projectId}`);
	const isOpen = $derived(openRows.isOpen(openRowKey));
	const taskCount = $derived(countTasksInTree(tasks));
	const taskCountLabel = $derived(taskCount === 1 ? '1 task' : `${taskCount} tasks`);
	const panelId = $derived(`task-group-${groupKeyOf(group)}`);
</script>

<section class="border-b border-hairline last:border-b-0">
	<TaskGroupHeader
		{goal}
		{projectId}
		{taskCountLabel}
		{isOpen}
		{panelId}
		onToggle={() => openRows.toggle(openRowKey)}
	/>
	{#if isOpen}
		<ol id={panelId} class="flex flex-col divide-y divide-hairline">
			{#each tasks as task, taskIndex (task.id)}
				<TaskListRow
					{task}
					numberPath={`${task.priority}`}
					isFirst={taskIndex === 0}
					isLast={taskIndex === tasks.length - 1}
					{listReorder}
					{actions}
				/>
			{/each}
		</ol>
	{/if}
</section>
