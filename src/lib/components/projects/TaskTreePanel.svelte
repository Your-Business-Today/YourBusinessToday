<script lang="ts">
	import BacklogFilterBar from './BacklogFilterBar.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TaskGroupSections from './TaskGroupSections.svelte';
	import { BacklogView } from '$lib/client/backlogView.svelte';
	import { accountNameLookup } from '$lib/data/accountNames';
	import { backlogEmptyMessage } from './backlogEmptyMessage';
	import { rememberOpenRows } from '$lib/client/openRows.svelte';
	import { createTaskRowActions, type TaskRowHandlers, type TaskRowSources } from './taskRowActions';
	import { groupTasksByGoal, groupsOnHorizon, type TaskGroup } from './taskTreeGroups';
	import { currentGoalHorizon, longTermGoalHorizon } from '$lib/data/goalHorizon';
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

	const actions = $derived(createTaskRowActions(sources, handlers));
	const backlog = new BacklogView({
		taskTree: () => taskTree,
		assigneeIdsByTask: () => sources.assigneeIdsByTask,
		isWaitingOnMe: (task) => actions.turnFor(task.id)?.isOnViewer === true
	});
	const taskGroups = $derived(
		groupTasksByGoal(taskTree, sources.goals, (tasks) => backlog.visibleTasksOf(tasks))
	);
	const currentGroups = $derived(groupsOnHorizon(taskGroups, currentGoalHorizon));
	const longTermGroups = $derived(groupsOnHorizon(taskGroups, longTermGoalHorizon));
	const longTermNote =
		'Not scoped enough to count yet, so kept out of the tab, backlog and completion until the goal is made current.';
	const nameOf = $derived(accountNameLookup(sources.people));
	const assigneeLabel = $derived(assigneeLabelFor(backlog.assigneeId));
	const emptyStateMessage = $derived(
		backlogEmptyMessage({
			assigneeLabel,
			isWaitingOnMeOnly: backlog.isWaitingOnMeOnly,
			hasTasks: taskTree.length > 0
		})
	);

	function countAcross(groups: TaskGroup[]): number {
		return backlog.countAcross(groups.map((group) => group.tasks));
	}

	function assigneeLabelFor(personId: string | null): string | null {
		if (personId === null) return null;
		if (personId === sources.viewerId) return 'you';
		return nameOf(personId);
	}
</script>

<DashboardPanel title="Backlog" count={countAcross(currentGroups)}>
	{#snippet toolbar()}
		<BacklogFilterBar {backlog} people={sources.people} viewerId={sources.viewerId} />
	{/snippet}
	{#if currentGroups.length === 0}
		<p class="px-4 py-10 text-center text-sm text-chalk/60">{emptyStateMessage}</p>
	{:else}
		<TaskGroupSections groups={currentGroups} {backlog} {projectId} {actions} />
	{/if}
</DashboardPanel>
{#if longTermGroups.length > 0}
	<DashboardPanel title="Long term" count={countAcross(longTermGroups)}>
		<p class="border-b border-hairline px-4 py-2.5 text-xs text-chalk/50">{longTermNote}</p>
		<TaskGroupSections groups={longTermGroups} {backlog} {projectId} {actions} />
	</DashboardPanel>
{/if}
