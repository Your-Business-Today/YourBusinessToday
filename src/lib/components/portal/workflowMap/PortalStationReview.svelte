<script lang="ts">
	import StationReviewPanel from './StationReviewPanel.svelte';
	import { standingOf, type StationStandings } from '$lib/data/workflowMap/stationReview';
	import { stationReviewTallyOf, tallySentence } from '$lib/data/workflowMap/stationReviewTally';
	import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

	let { map, stationKey, standings }: { map: WorkflowMapVersion; stationKey: string | null; standings: StationStandings } = $props();

	const tally = $derived(tallySentence(stationReviewTallyOf(map, standings)));
</script>

{#if stationKey === null}
	<p class="text-sm text-chalk-subtle">{tally}</p>
{:else}
	<StationReviewPanel {map} {stationKey} standing={standingOf(standings, stationKey)} />
{/if}
