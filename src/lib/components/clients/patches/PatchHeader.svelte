<script lang="ts">
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import type { Patch } from '$lib/server/patches/patchRecord';

	let { patch, ownerName }: { patch: Patch; ownerName: string } = $props();

	const { sicCodes, outcodes } = $derived(patch);
	const reach = $derived(`${patch.radiusMiles} mile${patch.radiusMiles === 1 ? '' : 's'} around ${patch.centrePostcode}`);
	const trades = $derived(sicCodes.length === 0 ? 'every trade' : `SIC ${sicCodes.join(', ')}`);
</script>

<div class="flex flex-col gap-2">
	<a href="/clients/patches" class="font-display text-sm text-chalk/50 hover:text-chalk">← Patches</a>
	<PageTitle>{patch.name}</PageTitle>
	<p class="text-chalk/70">{reach} · {trades} · worked by {ownerName}</p>
	<ul class="flex flex-wrap gap-2">
		{#each outcodes as outcode (outcode)}
			<li class="rounded-full border border-hairline px-3 py-0.5 text-xs text-chalk/70">{outcode}</li>
		{/each}
	</ul>
</div>
