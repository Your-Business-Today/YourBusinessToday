<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import MapConfirmForm from './MapConfirmForm.svelte';
	import { canConfirmMap, mapConfirmationHeldBack, mapConfirmedSentence } from '$lib/data/workflowMap/mapConfirmed';
	import { portalHomePath } from '$lib/portal/portalPaths';
	import { stationReviewTallyOf, tallySentence } from '$lib/data/workflowMap/stationReviewTally';
	import type { MapConfirmation } from '$lib/data/workflowMap/mapConfirmed';
	import type { StationStandings } from '$lib/data/workflowMap/stationReview';
	import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

	let {
		map,
		standings,
		confirmation
	}: { map: WorkflowMapVersion; standings: StationStandings; confirmation: MapConfirmation | null } = $props();

	const tally = $derived(stationReviewTallyOf(map, standings));
</script>

<DashboardPanel id="map-confirmation-panel" title="Confirm your map">
	<div class="flex flex-col gap-3 px-4 py-4 text-sm sm:px-6">
		<p class="text-chalk-subtle">{tallySentence(tally)}</p>
		{#if confirmation !== null}
			<p class="text-chalk">{mapConfirmedSentence(confirmation, true)}</p>
			<a href={portalHomePath} class="self-start text-chalk underline">See the goals raised on your projects</a>
		{:else if canConfirmMap(tally)}
			<MapConfirmForm {map} />
		{:else}
			<p class="text-chalk/70">{mapConfirmationHeldBack(tally)}</p>
		{/if}
	</div>
</DashboardPanel>
