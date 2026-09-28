<script lang="ts">
	import BacklogFilterBar from './BacklogFilterBar.svelte';
	import TaskGroupSection from './TaskGroupSection.svelte';
	import { BacklogView } from '$lib/client/backlogView.svelte';
	import { ListReorder } from '$lib/client/listReorder.svelte';
	import { accountNameLookup } from '$lib/data/accountNames';
	import { backlogEmptyMessage } from './backlogEmptyMessage';
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

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h2 class="font-display text-sm tracking-widest text-chalk/50 uppercase">Backlog</h2>
		<BacklogFilterBar {backlog} people={sources.people} viewerId={sources.viewerId} />
	</div>
	{#if backlog.visibleTasks.length === 0}
		<p class="rounded-2xl border border-dashed border-hairline p-8 text-center text-chalk/60">
			{emptyStateMessage}
		</p>
	{:else}
		<div class="flex flex-col gap-6">
			{#each taskGroups as group (group.goal?.id ?? 'other')}
				<TaskGroupSection {group} {projectId} {listReorder} {actions} />
			{/each}
		</div>
	{/if}
</div>
