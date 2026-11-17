<script lang="ts">
	import BusinessBrainBody from '$lib/components/businessBrain/BusinessBrainBody.svelte';
	import LeadWorkspaceHeader from '$lib/components/clients/leadTabs/LeadWorkspaceHeader.svelte';
	import NoLeadOrganisation from '$lib/components/clients/leadTabs/NoLeadOrganisation.svelte';
	import { leadTabKeys } from '$lib/components/clients/leadTabs/leadTabs';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { client, organisationId, brain } = $derived(data);
</script>

<svelte:head>
	<title>Business Brain — {client.name} — Your Business Today</title>
</svelte:head>

<LeadWorkspaceHeader company={client} shownTab={leadTabKeys.brain}>
	<p class="text-sm text-chalk-subtle">What {client.name} knows, filed by its Claude through the connector, with the files it was written from.</p>
</LeadWorkspaceHeader>

<div class={workspaceBodyClasses}>
	{#if organisationId === null || brain === null}
		<NoLeadOrganisation company={client} />
	{:else}
		<BusinessBrainBody {organisationId} {brain} />
	{/if}
</div>
