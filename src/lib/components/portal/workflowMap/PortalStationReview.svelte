<script lang="ts">
	import MapConfirmationPanel from './MapConfirmationPanel.svelte';
	import StationReviewPanel from './StationReviewPanel.svelte';
	import { standingOf, type StationStandings } from '$lib/data/workflowMap/stationReview';
	import type { MapConfirmation } from '$lib/data/workflowMap/mapConfirmed';
	import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

	let {
		map,
		stationKey,
		standings,
		confirmation
	}: {
		map: WorkflowMapVersion;
		stationKey: string | null;
		standings: StationStandings;
		confirmation: MapConfirmation | null;
	} = $props();
</script>

{#if stationKey === null}
	<MapConfirmationPanel {map} {standings} {confirmation} />
{:else}
	<StationReviewPanel {map} {stationKey} standing={standingOf(standings, stationKey)} isConfirmed={confirmation !== null} />
{/if}
