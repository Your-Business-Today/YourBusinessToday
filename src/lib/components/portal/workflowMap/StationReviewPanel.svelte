<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import StationReviewForm from './StationReviewForm.svelte';
	import { standingSentence } from '$lib/data/workflowMap/stationReviewWords';
	import type { StationStanding } from '$lib/data/workflowMap/stationReview';
	import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

	let {
		map,
		stationKey,
		standing,
		isConfirmed
	}: { map: WorkflowMapVersion; stationKey: string; standing: StationStanding; isConfirmed: boolean } = $props();

	const confirmedVersionNote = 'You confirmed this version, so it takes no more marks. The next version filed is yours to check.';
	const carriedNote = $derived(
		standing.markedOnVersion === null ? null : `Marked on version ${standing.markedOnVersion}; the station is unchanged since.`
	);
</script>

<DashboardPanel id="station-review-panel" title="Your check">
	<div class="flex flex-col gap-4 px-4 py-4 text-sm sm:px-6">
		<div class="flex flex-col gap-1">
			<p class="text-chalk">{standingSentence(standing)}</p>
			{#if carriedNote !== null}
				<p class="text-chalk-subtle">{carriedNote}</p>
			{/if}
		</div>
		{#if isConfirmed}
			<p class="text-chalk-subtle">{confirmedVersionNote}</p>
		{:else}
			{#key `${map.stage}:${stationKey}`}
				<StationReviewForm {map} {stationKey} {standing} />
			{/key}
		{/if}
	</div>
</DashboardPanel>
