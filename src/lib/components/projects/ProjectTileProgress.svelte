<script lang="ts">
	import AssignedToYouNote from './AssignedToYouNote.svelte';
	import CompletionBar from './CompletionBar.svelte';

	let {
		openTaskCount,
		taskCount,
		completionPercent,
		assignedTaskCount,
		longTermGoalCount
	}: {
		openTaskCount: number;
		taskCount: number;
		completionPercent: number;
		assignedTaskCount: number;
		longTermGoalCount: number;
	} = $props();

	const taskCountLine = $derived(describeTaskCount());
	const longTermGoalLine = $derived(describeLongTermGoals(longTermGoalCount));

	function describeTaskCount(): string {
		if (taskCount === 0) return 'No tasks yet';
		if (openTaskCount === 0) return `All ${taskCount} done`;
		return `${openTaskCount} open of ${taskCount}`;
	}

	function describeLongTermGoals(goalCount: number): string {
		if (goalCount === 0) return '';
		if (goalCount === 1) return '1 long term goal';
		return `${goalCount} long term goals`;
	}
</script>

<div class="mt-auto flex flex-col gap-2">
	<div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
		<span class="flex flex-wrap gap-x-2 font-display text-xs text-chalk/50">
			<span>{taskCountLine}</span>
			{#if longTermGoalLine !== ''}
				<span class="text-chalk/40">{longTermGoalLine}</span>
			{/if}
		</span>
		<AssignedToYouNote {assignedTaskCount} />
	</div>
	{#if taskCount > 0}
		<CompletionBar {completionPercent} />
	{/if}
</div>
