<script lang="ts">
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import { lastRunSentence } from '$lib/data/watcherSentences';
	import type { Patch } from '$lib/server/patches/patchRecord';
	import type { WatcherTimes } from '$lib/server/watch/readWatcherTimes';

	let { patch, ownerName, watchers }: { patch: Patch; ownerName: string; watchers: WatcherTimes } = $props();

	const heartbeat = $derived(lastRunSentence('Heartbeat', 'Watchers have not run yet', watchers.heartbeatAt));
	const foodHygiene = $derived(lastRunSentence('Food premises swept', 'Food premises not swept yet', watchers.foodHygieneAt));

	const { sicCodes, outcodes } = $derived(patch);
	const reach = $derived(`${patch.radiusMiles} mile${patch.radiusMiles === 1 ? '' : 's'} around ${patch.centrePostcode}`);
	const trades = $derived(sicCodes.length === 0 ? 'every trade' : `SIC ${sicCodes.join(', ')}`);
</script>

<div class="flex flex-col gap-2">
	<a href="/clients/patches" class="font-display text-sm text-chalk/50 hover:text-chalk">← Patches</a>
	<PageTitle>{patch.name}</PageTitle>
	<p class="flex flex-wrap gap-3 text-sm text-chalk/60">
		<a href={`/clients/patches/${patch.id}/sightings`} class="hover:text-signal">Every sighting in this patch</a>
		<a href={`/clients/feed?patch=${patch.id}`} class="hover:text-signal">What changed here</a>
	</p>
	<p class="text-chalk/70">{reach} · {trades} · worked by {ownerName}</p>
	<p class="text-xs text-chalk/50">{heartbeat} · {foodHygiene}</p>
	<ul class="flex flex-wrap gap-2">
		{#each outcodes as outcode (outcode)}
			<li class="rounded-full border border-hairline px-3 py-0.5 text-xs text-chalk/70">{outcode}</li>
		{/each}
	</ul>
</div>
