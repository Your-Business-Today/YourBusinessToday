<script lang="ts">
	import BacklogFilterBar from './BacklogFilterBar.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TaskGroupSection from './TaskGroupSection.svelte';
	import { BacklogView } from '$lib/client/backlogView.svelte';
	import { ListReorder } from '$lib/client/listReorder.svelte';
	import { accountNameLookup } from '$lib/data/accountNames';
	import { backlogEmptyMessage } from './backlogEmptyMessage';
	import { countTasksInTree } from './taskTreeCounts';
	import { postListReorder } from '$lib/client/postListReorder';
	import { rememberOpenRows } from '$lib/client/openRows.svelte';
	import { createTaskRowActions, type TaskRowHandlers, type TaskRowSources } from './taskRowActions';
	import { groupTasksByGoal } from './taskTreeGroups';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let {
		taskTree,
		projectId,
		sources,
		handlers
	}: {
		taskTree: TaskTreeNode[];
		projectId: string;
		sources: TaskRowSources;
		handlers: TaskRowHandlers;
	} = $props();

	rememberOpenRows();

	const listReorder = new ListReorder(
		(movedTaskId, targetTaskId, placement) =>
			postListReorder('?/placeTask', { movedTaskId, targetTaskId, placement }),
		{ canNestRows: true }
	);

	const actions = $derived(createTaskRowActions(sources, handlers));
	const backlog = new BacklogView({
		taskTree: () => taskTree,
		assigneeIdsByTask: () => sources.assigneeIdsByTask,
		isWaitingOnMe: (task) => actions.turnFor(task.id)?.isOnViewer === true
	});
	const taskGroups = $derived(
		groupTasksByGoal(taskTree, sources.goals, (tasks) => backlog.visibleTasksOf(tasks))
	);
	const nameOf = $derived(accountNameLookup(sources.people));
	const assigneeLabel = $derived(assigneeLabelFor(backlog.assigneeId));
	const emptyStateMessage = $derived(
		backlogEmptyMessage({
			assigneeLabel,
			isWaitingOnMeOnly: backlog.isWaitingOnMeOnly,
			hasTasks: taskTree.length > 0
		})
	);

	function assigneeLabelFor(personId: string | null): string | null {
		if (personId === null) return null;
		if (personId === sources.viewerId) return 'you';
		return nameOf(personId);
	}
</script>

<DashboardPanel title="Backlog" count={countTasksInTree(backlog.visibleTasks)}>
	{#snippet toolbar()}
		<BacklogFilterBar {backlog} people={sources.people} viewerId={sources.viewerId} />
	{/snippet}
	{#if backlog.visibleTasks.length === 0}
		<p class="px-4 py-10 text-center text-sm text-chalk/60">{emptyStateMessage}</p>
	{:else}
		<div class="flex flex-col">
			{#each taskGroups as group (group.goal?.id ?? 'other')}
				<TaskGroupSection {group} {projectId} {listReorder} {actions} />
			{/each}
		</div>
	{/if}
</DashboardPanel>
