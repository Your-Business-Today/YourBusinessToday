<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import ProseText from '$lib/components/site/ProseText.svelte';
	import { goalMapOriginLink } from './goalMapOrigin';
	import type { ConfirmedMapVersion } from '$lib/server/workflowMap/readConfirmedMapVersions';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let { goal, mapOrigin = null }: { goal: Goal; mapOrigin?: ConfirmedMapVersion | null } = $props();

	const origin = $derived(mapOrigin === null ? null : goalMapOriginLink(mapOrigin));
</script>

<DashboardPanel title="Measure">
	<div class="flex flex-col gap-2 px-4 py-3">
		{#if goal.measure === ''}
			<p class="text-sm text-chalk/50">No measure written yet — how will we know it is met?</p>
		{:else}
			<ProseText text={goal.measure} class="text-sm text-chalk/80" />
		{/if}
		{#if origin !== null}
			<a href={origin.href} class="text-xs text-chalk/60 transition hover:text-go">{origin.label}</a>
		{/if}
	</div>
</DashboardPanel>
