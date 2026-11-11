<script lang="ts">
	import { fade } from 'svelte/transition';
	import BacklogFilterBar from '../BacklogFilterBar.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import InternalWorkTable from './InternalWorkTable.svelte';
	import InternalStatusBoard from './InternalStatusBoard.svelte';
	import InternalWorkCalendar from './InternalWorkCalendar.svelte';
	import { BacklogView } from '$lib/client/backlogView.svelte';
	import { RememberedChoice } from '$lib/client/rememberedChoice.svelte';
	import { tabSwap } from '$lib/client/motion';
	import { createTaskRowActions, type TaskRowHandlers, type TaskRowSources } from '../taskRowActions';
	import { internalWorkGroups } from './internalWorkGroups';
	import { internalWorkViewLabels, internalWorkViewOrder, internalWorkViews, internalWorkViewStorageKey } from '$lib/data/internalWorkView';
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

	const chosenView = new RememberedChoice(internalWorkViewStorageKey, internalWorkViews.table);
	chosenView.remember(internalWorkViewOrder);
	const viewTabs = internalWorkViewOrder.map((view) => ({ key: view, label: internalWorkViewLabels[view], count: null }));

	const actions = $derived(createTaskRowActions(sources, handlers));
	const board = new BacklogView({
		taskTree: () => taskTree,
		assigneeIdsByTask: () => sources.assigneeIdsByTask,
		isWaitingOnMe: (task) => actions.turnFor(task.id)?.isOnViewer === true
	});
	const isTableShown = $derived(chosenView.key === internalWorkViews.table);
	const groups = $derived(internalWorkGroups(isTableShown ? board.visibleTasks : board.visibleTasksDoneOrNot));
	const items = $derived(groups.flatMap((group) => group.items));
	const openItemCount = $derived(groups.reduce((count, group) => count + group.openItemCount, 0));
</script>

<TabStrip tabs={viewTabs} bind:selectedKey={chosenView.key} />
<DashboardPanel title="Board" count={openItemCount}>
	{#snippet toolbar()}
		<BacklogFilterBar backlog={board} people={sources.people} viewerId={sources.viewerId} isDoneFilterShown={isTableShown} />
	{/snippet}
	{#key chosenView.key}
		<div in:fade={tabSwap}>
			{#if isTableShown}
				<InternalWorkTable {groups} {actions} people={sources.people} todosByTask={sources.todosByTask} {onAddItem} />
			{:else if chosenView.key === internalWorkViews.statusBoard}
				<InternalStatusBoard {items} {actions} />
			{:else}
				<InternalWorkCalendar {items} todosByTask={sources.todosByTask} />
			{/if}
		</div>
	{/key}
</DashboardPanel>
