<script lang="ts">
	import AssignedToYouNote from './AssignedToYouNote.svelte';
	import { longTermGoalLine, taskTallyLine } from '$lib/data/projectTaskTally';

	let {
		openTaskCount,
		taskCount,
		assignedTaskCount,
		longTermGoalCount
	}: {
		openTaskCount: number;
		taskCount: number;
		assignedTaskCount: number;
		longTermGoalCount: number;
	} = $props();

	const tally = $derived(taskTallyLine(openTaskCount, taskCount));
	const goalLine = $derived(longTermGoalLine(longTermGoalCount));
</script>

<span class="flex flex-wrap gap-x-2 font-display text-xs text-chalk/50">
	<span>{tally}</span>
	{#if goalLine !== ''}
		<span class="text-chalk/40">{goalLine}</span>
	{/if}
	<AssignedToYouNote {assignedTaskCount} />
</span>
