<script lang="ts">
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import { clientStageLabels } from '$lib/data/clientLifecycle';
	import { leadSourceLabels } from '$lib/data/leadSources';
	import type { Client } from '$lib/server/clients/clientRecord';

	let { client, parent }: { client: Client; parent: Client | null } = $props();
</script>

<div class="flex flex-col gap-2">
	<a href="/clients" class="font-display text-sm text-chalk/50 hover:text-chalk">← Clients</a>
	<PageTitle>{client.name}</PageTitle>
	<p class="text-chalk/70">
		{clientStageLabels[client.stage]} · {leadSourceLabels[client.leadSource]}
		{#if parent !== null}
			· Part of <a href={`/clients/${parent.id}`} class="hover:text-signal">{parent.name}</a>
		{/if}
		{#if client.website !== ''}
			· <a href={client.website} class="hover:text-signal">{client.website}</a>
		{/if}
	</p>
</div>
