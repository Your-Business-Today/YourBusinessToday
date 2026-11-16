<script lang="ts">
	import PremisesPanel from './PremisesPanel.svelte';
	import { fetchPremisesOfPin } from './fetchPremisesOfPin';
	import type { AreaPin } from '$lib/server/clients/area/areaPin';

	let { pin, patchId }: { pin: AreaPin; patchId: string } = $props();

	const premises = $derived(fetchPremisesOfPin(patchId, pin));
</script>

{#await premises}
	{@render namedOnly('Reading what is known of it…')}
{:then found}
	<PremisesPanel premises={found} {patchId} />
{:catch}
	{@render namedOnly('It could not be read just now. Pick it again.')}
{/await}

{#snippet namedOnly(note: string)}
	<aside class="flex flex-col gap-1 rounded-2xl border border-hairline bg-carriage p-5">
		<h2 class="font-display text-xl font-medium">{pin.name}</h2>
		<p class="text-sm text-chalk/70">{pin.address === '' ? pin.postcode : pin.address}</p>
		<p class="text-xs text-chalk/50">{note}</p>
	</aside>
{/snippet}
