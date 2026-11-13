<script lang="ts">
	import { companyPagePath } from '$lib/data/salesRegisters';
	import ClientRowActions from './ClientRowActions.svelte';
	import StagePill from './StagePill.svelte';
	import { leadSourceLabels } from '$lib/data/leadSources';
	import type { ClientSummary } from '$lib/server/clients/listClients';

	let { client, broughtInBy }: { client: ClientSummary; broughtInBy: string } = $props();

	function describe(client: ClientSummary): string {
		const contact = client.primaryContactName === '' ? 'No contact yet' : client.primaryContactName;
		const projects = `${client.projectCount} project${client.projectCount === 1 ? '' : 's'}`;
		const broughtInLine = broughtInBy === '' ? 'Brought in by nobody named' : `Brought in by ${broughtInBy}`;
		return [contact, projects, leadSourceLabels[client.leadSource], broughtInLine].join(' · ');
	}
</script>

<li class="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
	<div class="min-w-0">
		<a href={companyPagePath(client)} class="font-display hover:text-signal">{client.name}</a>
		<p class="text-xs text-chalk/50">
			{describe(client)}
			{#if client.awaitingAnswerCount > 0}
				· <span class="text-signal">{client.awaitingAnswerCount} awaiting an answer</span>
			{/if}
		</p>
	</div>
	<div class="flex shrink-0 items-center gap-2">
		<StagePill stage={client.stage} />
		<ClientRowActions {client} />
	</div>
</li>
