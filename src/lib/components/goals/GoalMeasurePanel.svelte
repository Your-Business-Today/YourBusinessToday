<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import ProseText from '$lib/components/site/ProseText.svelte';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let { goal }: { goal: Goal } = $props();
</script>

<DashboardPanel title="Measure">
	<div class="px-4 py-3">
		{#if goal.measure === ''}
			<p class="text-sm text-chalk/50">No measure written yet — how will we know it is met?</p>
		{:else}
			<ProseText text={goal.measure} class="text-sm text-chalk/80" />
		{/if}
	</div>
</DashboardPanel>
