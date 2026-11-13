<script lang="ts">
	import AssignedToYouNote from './AssignedToYouNote.svelte';
	import { taskTallyLine } from '$lib/data/projectTaskTally';

	let {
		openTaskCount,
		taskCount,
		assignedTaskCount
	}: {
		openTaskCount: number;
		taskCount: number;
		assignedTaskCount: number;
	} = $props();

	const tally = $derived(taskTallyLine(openTaskCount, taskCount));
</script>

<span class="flex flex-wrap gap-x-2 font-display text-xs text-chalk/50">
	<span>{tally}</span>
	<AssignedToYouNote {assignedTaskCount} />
</span>
