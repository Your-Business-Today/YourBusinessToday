<script lang="ts">
	import AssignedToYouNote from './AssignedToYouNote.svelte';
	import CompletionBar from './CompletionBar.svelte';

	let {
		openTaskCount,
		taskCount,
		completionPercent,
		assignedTaskCount
	}: {
		openTaskCount: number;
		taskCount: number;
		completionPercent: number;
		assignedTaskCount: number;
	} = $props();

	const taskCountLine = $derived(describeTaskCount());

	function describeTaskCount(): string {
		if (taskCount === 0) return 'No tasks yet';
		if (openTaskCount === 0) return `All ${taskCount} done`;
		return `${openTaskCount} open of ${taskCount}`;
	}
</script>

<div class="mt-auto flex flex-col gap-2">
	<div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
		<span class="font-display text-xs text-chalk/50">{taskCountLine}</span>
		<AssignedToYouNote {assignedTaskCount} />
	</div>
	{#if taskCount > 0}
		<CompletionBar {completionPercent} />
	{/if}
</div>
