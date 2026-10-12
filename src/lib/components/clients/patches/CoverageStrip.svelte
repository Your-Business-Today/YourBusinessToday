<script lang="ts">
	import StatTile from '$lib/components/workspace/StatTile.svelte';
	import type { CoverageCounts } from '$lib/data/sectorCoverage';

	let { counts }: { counts: CoverageCounts } = $props();

	const searchedTone = $derived(counts.searched > 0 ? 'go' : 'plain');
	const staleTone = $derived(counts.stale > 0 ? 'attention' : 'plain');
</script>

<div class="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
	<StatTile label="Searched" value={`${counts.searched} of ${counts.total}`} caption="sectors in the last 90 days" tone={searchedTone} />
	<StatTile label="Stale" value={`${counts.stale}`} caption="searched over 90 days ago" tone={staleTone} />
	<StatTile label="Claimed" value={`${counts.claimed}`} caption="being worked now" />
	<StatTile label="Not yet" value={`${counts.unsearched}`} caption="never searched" />
</div>
