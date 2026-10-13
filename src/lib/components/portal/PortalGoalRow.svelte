<script lang="ts">
	import ProgressTrack from '$lib/components/workspace/ProgressTrack.svelte';
	import type { PortalGoal } from '$lib/portal/portalProject';

	let { goal, shouldShowMeasure = false }: { goal: PortalGoal; shouldShowMeasure?: boolean } =
		$props();

	const openTaskLabel = $derived(
		goal.openTaskCount === 1 ? '1 task to go' : `${goal.openTaskCount} tasks to go`
	);
	const hasMeasure = $derived(shouldShowMeasure && goal.measure !== '');
</script>

<div class="flex min-w-0 flex-col gap-1">
	<span class="truncate font-display text-sm text-chalk">{goal.title}</span>
	{#if hasMeasure}
		<span class="text-xs text-chalk/60">Measured by: {goal.measure}</span>
	{/if}
	<ProgressTrack completionPercent={goal.completionPercent} />
	<span class="flex flex-wrap gap-x-2 text-[0.7rem] text-chalk/50">
		<span>{goal.completionPercent}% done</span>
		<span>{openTaskLabel}</span>
	</span>
</div>
