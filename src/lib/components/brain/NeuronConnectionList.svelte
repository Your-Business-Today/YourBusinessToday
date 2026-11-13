<script lang="ts">
	import NeuronConnectionRow from './NeuronConnectionRow.svelte';
	import type { NeuronConnection } from './neuronConnections';

	let { connections, onOpen }: { connections: NeuronConnection[]; onOpen: (slug: string) => void } = $props();
</script>

<section class="flex flex-col gap-2 p-5">
	<h4 class="font-display text-xs tracking-widest text-chalk/60 uppercase">Connected to · {connections.length}</h4>
	{#if connections.length === 0}
		<p class="text-sm text-chalk/50">No other page is linked to this one yet.</p>
	{:else}
		<ul class="flex flex-col divide-y divide-hairline">
			{#each connections as connection (`${connection.slug}-${connection.direction}`)}
				<li><NeuronConnectionRow {connection} {onOpen} /></li>
			{/each}
		</ul>
	{/if}
</section>
