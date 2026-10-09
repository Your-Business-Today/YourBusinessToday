<script lang="ts">
	import ClientStageForm from './ClientStageForm.svelte';
	import { leadSourceLabels } from '$lib/data/leadSources';
	import type { ClientSummary } from '$lib/server/clients/listClients';

	let { client }: { client: ClientSummary } = $props();

	function describe(client: ClientSummary): string {
		const contact = client.primaryContactName === '' ? 'No contact yet' : client.primaryContactName;
		const projects = `${client.projectCount} project${client.projectCount === 1 ? '' : 's'}`;
		return [contact, projects, leadSourceLabels[client.leadSource]].join(' · ');
	}
</script>

<li class="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
	<div class="min-w-0">
		<a href={`/clients/${client.id}`} class="font-display hover:text-signal">{client.name}</a>
		<p class="text-xs text-chalk/50">
			{describe(client)}
			{#if client.awaitingAnswerCount > 0}
				· <span class="text-signal">{client.awaitingAnswerCount} awaiting an answer</span>
			{/if}
		</p>
	</div>
	<ClientStageForm clientId={client.id} stage={client.stage} />
</li>
