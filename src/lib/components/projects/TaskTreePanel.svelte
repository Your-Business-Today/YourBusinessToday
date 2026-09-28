<script lang="ts">
	import DoneTaskFilter from './DoneTaskFilter.svelte';
	import TaskGroupSection from './TaskGroupSection.svelte';
	import WaitingOnMeFilter from './WaitingOnMeFilter.svelte';
	import { ListReorder } from '$lib/client/listReorder.svelte';
	import { postListReorder } from '$lib/client/postListReorder';
	import { rememberOpenRows } from '$lib/client/openRows.svelte';
	import { createTaskRowActions, type TaskRowHandlers, type TaskRowSources } from './taskRowActions';
	import { groupTasksByGoal } from './taskTreeGroups';
	import { countTasksWhere, onlyTasksWhere, withoutDoneTasks } from './taskTreeFilters';
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

	let shouldIncludeDone = $state(false);
	let isWaitingOnMeOnly = $state(false);

	const listReorder = new ListReorder(
		(movedTaskId, targetTaskId, placement) =>
			postListReorder('?/placeTask', { movedTaskId, targetTaskId, placement }),
		{ canNestRows: true }
	);

	const actions = $derived(createTaskRowActions(sources, handlers));
	const isWaitingOnMe = (task: TaskTreeNode) => actions.turnFor(task.id)?.isOnViewer === true;
	const waitingCount = $derived(countTasksWhere(withoutDoneTasks(taskTree), isWaitingOnMe));
	const visibleTasks = $derived(visibleTasksOf(taskTree));
	const taskGroups = $derived(groupTasksByGoal(taskTree, sources.goals, visibleTasksOf));

	function visibleTasksOf(tasks: TaskTreeNode[]): TaskTreeNode[] {
		const openTasks = shouldIncludeDone ? tasks : withoutDoneTasks(tasks);
		if (!isWaitingOnMeOnly) return openTasks;
		return onlyTasksWhere(openTasks, isWaitingOnMe);
	}
	const emptyStateMessage = $derived.by(() => {
		if (isWaitingOnMeOnly) return 'Nothing is waiting on you or your Claude.';
		if (taskTree.length > 0)
			return 'Everything here is done — switch the filter to All to see finished tasks.';
		return 'No tasks yet — add one.';
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h2 class="font-display text-sm tracking-widest text-chalk/50 uppercase">Backlog</h2>
		<div class="flex flex-wrap items-center gap-2">
			<WaitingOnMeFilter bind:isWaitingOnMeOnly {waitingCount} />
			<DoneTaskFilter bind:shouldIncludeDone />
		</div>
	</div>
	{#if visibleTasks.length === 0}
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
