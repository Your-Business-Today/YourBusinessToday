<script lang="ts">
	import ClientRow from './ClientRow.svelte';
	import { broughtInByName } from '$lib/data/broughtInByName';
	import type { ClientSummary } from '$lib/server/clients/listClients';
	import type { StaffMember } from '$lib/server/projects/getStaffDirectory';

	let { clients, staffMembers }: { clients: ClientSummary[]; staffMembers: StaffMember[] } = $props();
</script>

<ul class="divide-y divide-hairline rounded-2xl border border-hairline">
	{#each clients as client (client.id)}
		<ClientRow {client} broughtInBy={broughtInByName(staffMembers, client.ownerId)} />
	{/each}
</ul>
