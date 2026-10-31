<script lang="ts">
	import GlobalTaskDetail from './GlobalTaskDetail.svelte';
	import GlobalTaskModals from './GlobalTaskModals.svelte';
	import GlobalTaskRow from './GlobalTaskRow.svelte';
	import { topRank } from '$lib/data/topRank';
	import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';

	let {
		tasks,
		firstTaskNumber,
		taskCount,
		shouldIncludeDone,
		canReorder
	}: {
		tasks: GlobalTask[];
		firstTaskNumber: number;
		taskCount: number;
		shouldIncludeDone: boolean;
		canReorder: boolean;
	} = $props();

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
</script>

<ol class="flex flex-col divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-carriage">
	{#each tasks as task, taskIndex (task.id)}
		{@const positionNumber = firstTaskNumber + taskIndex}
		<li class="flex flex-col">
			<GlobalTaskRow
				{task}
				positionNumber={task.globalPriority ?? positionNumber}
				isFirst={positionNumber === topRank}
				isLast={positionNumber === taskCount}
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
		</li>
	{/each}
</ol>

<GlobalTaskModals {statusTask} {priorityTask} bind:isStatusModalOpen bind:isPriorityModalOpen />
