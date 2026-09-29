<script lang="ts">
	import GlobalTaskFilter from '$lib/components/tasks/GlobalTaskFilter.svelte';
	import GlobalTaskDetail from '$lib/components/tasks/GlobalTaskDetail.svelte';
	import GlobalTaskModals from '$lib/components/tasks/GlobalTaskModals.svelte';
	import GlobalTaskPagination from '$lib/components/tasks/GlobalTaskPagination.svelte';
	import GlobalTaskRow from '$lib/components/tasks/GlobalTaskRow.svelte';
	import TasksPageHeader from '$lib/components/tasks/TasksPageHeader.svelte';
	import { ListReorder } from '$lib/client/listReorder.svelte';
	import { postListReorder } from '$lib/client/postListReorder';
	import { filterForAssignedTasks, filterForEveryTask } from '$lib/data/taskListFilter';
	import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';

	let { data } = $props();

	const listReorder = new ListReorder((movedTaskId, targetTaskId, placement) =>
		postListReorder('?/placeTask', { movedTaskId, targetTaskId, placement })
	);

	let isStatusModalOpen = $state(false);
	let isPriorityModalOpen = $state(false);
	let statusTask = $state<GlobalTask | null>(null);
	let priorityTask = $state<GlobalTask | null>(null);
	let expandedTaskId = $state<string | null>(null);

	function toggleDetail(task: GlobalTask) {
		expandedTaskId = expandedTaskId === task.id ? null : task.id;
	}

	function openStatusModal(task: GlobalTask) {
		statusTask = task;
		isStatusModalOpen = true;
	}

	function openPriorityModal(task: GlobalTask) {
		priorityTask = task;
		isPriorityModalOpen = true;
	}

	const shouldIncludeDone = $derived(data.filter === filterForEveryTask);
	const canReorder = $derived(data.filter !== filterForAssignedTasks);
	const taskCountLabel = $derived(
		`${data.taskPage.taskCount} ${shouldIncludeDone ? 'task' : 'open task'}${
			data.taskPage.taskCount === 1 ? '' : 's'
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

<div class="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16">
	<TasksPageHeader filter={data.filter} />
	<div class="flex flex-wrap items-center justify-between gap-4">
		<GlobalTaskFilter filter={data.filter} />
		<p class="font-display text-sm text-chalk/50">{taskCountLabel}</p>
	</div>
	{#if data.taskPage.tasks.length === 0}
		<p class="rounded-2xl border border-dashed border-hairline p-8 text-center text-chalk/60">
			{emptyMessages[data.filter]}
		</p>
	{:else}
		<ol class="flex flex-col divide-y divide-hairline rounded-2xl border border-hairline">
			{#each data.taskPage.tasks as task, taskIndex (task.id)}
				<GlobalTaskRow
					{task}
					{listReorder}
					positionNumber={task.globalPriority ?? data.taskPage.firstTaskNumber + taskIndex}
					isFirst={data.taskPage.firstTaskNumber + taskIndex === 1}
					isLast={data.taskPage.firstTaskNumber + taskIndex === data.taskPage.taskCount}
					{shouldIncludeDone}
					{canReorder}
					onChangeStatus={openStatusModal}
					onSetPriority={openPriorityModal}
					isExpanded={expandedTaskId === task.id}
					onToggleDetail={toggleDetail}
				/>
				{#if expandedTaskId === task.id}
					<GlobalTaskDetail {task} />
				{/if}
			{/each}
		</ol>
		<GlobalTaskPagination
			pageNumber={data.taskPage.pageNumber}
			pageCount={data.taskPage.pageCount}
			filter={data.filter}
		/>
	{/if}
</div>

<GlobalTaskModals {statusTask} {priorityTask} bind:isStatusModalOpen bind:isPriorityModalOpen />
