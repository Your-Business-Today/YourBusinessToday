<script lang="ts">
	import GlobalTaskFilter from '$lib/components/tasks/GlobalTaskFilter.svelte';
	import GlobalTaskList from '$lib/components/tasks/GlobalTaskList.svelte';
	import GlobalTaskPagination from '$lib/components/tasks/GlobalTaskPagination.svelte';
	import TasksPageHeader from '$lib/components/tasks/TasksPageHeader.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { filterForAssignedTasks, filterForEveryTask } from '$lib/data/taskListFilter';

	let { data } = $props();

	const { tasks, taskCount, firstTaskNumber, pageNumber, pageCount } = $derived(data.taskPage);
	const shouldIncludeDone = $derived(data.filter === filterForEveryTask);
	const canReorder = $derived(data.filter !== filterForAssignedTasks);
	const taskCountLabel = $derived(
		`${taskCount} ${shouldIncludeDone ? 'task' : 'open task'}${
			taskCount === 1 ? '' : 's'
		}`
	);
	const emptyMessages: Record<typeof data.filter, string> = {
		open: 'No tasks here — add one from a project.',
		all: 'No tasks here — add one from a project.',
		assigned: 'Nothing open is assigned to you on any project.'
	};
</script>

<svelte:head>
	<title>Tasks — Your Business Today</title>
</svelte:head>

<TasksPageHeader filter={data.filter} />

<div class={workspaceBodyClasses}>
	<div class="flex flex-wrap items-center justify-between gap-3">
		<GlobalTaskFilter filter={data.filter} />
		<p class="font-display text-xs text-chalk/50">{taskCountLabel}</p>
	</div>
	{#if tasks.length === 0}
		<p class="rounded-xl border border-dashed border-hairline p-8 text-center text-sm text-chalk/60">
			{emptyMessages[data.filter]}
		</p>
	{:else}
		<GlobalTaskList {tasks} {firstTaskNumber} {taskCount} {shouldIncludeDone} {canReorder} />
		<GlobalTaskPagination
			pageNumber={pageNumber}
			pageCount={pageCount}
			filter={data.filter}
		/>
	{/if}
</div>
