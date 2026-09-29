<script lang="ts">
	import PriorityModal from '$lib/components/site/PriorityModal.svelte';
	import TaskStatusModal from '$lib/components/projects/TaskStatusModal.svelte';
	import { topRank } from '$lib/server/ordering/rankedSet';
	import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';

	let {
		statusTask,
		priorityTask,
		isStatusModalOpen = $bindable(),
		isPriorityModalOpen = $bindable()
	}: {
		statusTask: GlobalTask | null;
		priorityTask: GlobalTask | null;
		isStatusModalOpen: boolean;
		isPriorityModalOpen: boolean;
	} = $props();
</script>

{#if statusTask !== null}
	<TaskStatusModal task={statusTask} bind:isOpen={isStatusModalOpen} />
{/if}

{#if priorityTask !== null}
	<PriorityModal
		itemName={priorityTask.title}
		priority={priorityTask.globalPriority ?? topRank}
		among="of your queue across every project"
		action="?/setQueuePriority"
		fields={{ taskId: priorityTask.id }}
		bind:isOpen={isPriorityModalOpen}
	/>
{/if}
