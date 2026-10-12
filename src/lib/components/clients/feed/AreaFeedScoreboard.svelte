<script lang="ts">
	import StatTile from '$lib/components/workspace/StatTile.svelte';
	import type { AreaFeedScore } from '$lib/data/areaFeedScore';

	let { score }: { score: AreaFeedScore } = $props();

	const searchedTone = $derived(score.searchedCount > 0 ? 'go' : 'plain');
</script>

<div class="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
	<StatTile label="Searched today" value={`${score.searchedCount}`} caption="sectors marked searched" tone={searchedTone} />
	<StatTile label="Sighted today" value={`${score.sightedCount}`} caption="businesses found on the web" />
	<StatTile label="Leads today" value={`${score.leadCount}`} caption="put on the register" />
	<StatTile label="Arrived today" value={`${score.arrivedCount}`} caption="companies new on the register" />
</div>
