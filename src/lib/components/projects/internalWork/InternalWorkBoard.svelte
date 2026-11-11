<script lang="ts">
	import BacklogFilterBar from '../BacklogFilterBar.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import InternalWorkGroupTable from './InternalWorkGroupTable.svelte';
	import { BacklogView } from '$lib/client/backlogView.svelte';
	import { createTaskRowActions, type TaskRowHandlers, type TaskRowSources } from '../taskRowActions';
	import { internalWorkGroups } from './internalWorkGroups';
	import type { Department } from '$lib/data/department';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';
	import type { Todo } from '$lib/server/todos/todoRecord';

	type InternalWorkSources = TaskRowSources & { todosByTask: Record<string, Todo[]> };

	let {
		taskTree,
		sources,
		handlers,
		onAddItem
	}: {
		taskTree: TaskTreeNode[];
		sources: InternalWorkSources;
		handlers: TaskRowHandlers;
		onAddItem: (department: Department) => void;
	} = $props();

	const actions = $derived(createTaskRowActions(sources, handlers));
	const board = new BacklogView({
		taskTree: () => taskTree,
		assigneeIdsByTask: () => sources.assigneeIdsByTask,
		isWaitingOnMe: (task) => actions.turnFor(task.id)?.isOnViewer === true
	});
	const groups = $derived(internalWorkGroups(board.visibleTasks));
	const openItemCount = $derived(groups.reduce((count, group) => count + group.openItemCount, 0));
</script>

<DashboardPanel title="Board" count={openItemCount}>
	{#snippet toolbar()}
		<BacklogFilterBar backlog={board} people={sources.people} viewerId={sources.viewerId} />
	{/snippet}
	{#each groups as group (group.department)}
		<InternalWorkGroupTable
			{group}
			{actions}
			people={sources.people}
			todosByTask={sources.todosByTask}
			onAddItem={() => onAddItem(group.department)}
		/>
	{/each}
</DashboardPanel>
