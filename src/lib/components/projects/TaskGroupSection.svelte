<script lang="ts">
	import TaskGroupHeader from './TaskGroupHeader.svelte';
	import TaskGroupList from './TaskGroupList.svelte';
	import { openRows } from '$lib/client/openRows.svelte';
	import { groupKeyOf, type TaskGroup } from './taskTreeGroups';
	import type { TaskRowActions } from './taskRowActions';

	let {
		group,
		taskCount,
		projectId,
		actions
	}: {
		group: TaskGroup;
		taskCount: number;
		projectId: string;
		actions: TaskRowActions;
	} = $props();

	const { goal, tasks } = $derived(group);
	const openRowKey = $derived(goal?.id ?? `no-goal-${projectId}`);
	const isOpen = $derived(openRows.isOpen(openRowKey));
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
		<TaskGroupList {panelId} {tasks} {actions} />
	{/if}
</section>
