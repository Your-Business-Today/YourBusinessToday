<script lang="ts">
	import ClientRow from './ClientRow.svelte';
	import type { ClientSummary } from '$lib/server/clients/listClients';

	let { clients }: { clients: ClientSummary[] } = $props();
</script>

<ul class="divide-y divide-hairline rounded-2xl border border-hairline">
	{#each clients as client (client.id)}
		<ClientRow {client} />
	{/each}
</ul>
