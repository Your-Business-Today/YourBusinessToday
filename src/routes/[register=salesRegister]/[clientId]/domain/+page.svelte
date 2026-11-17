<script lang="ts">
	import LeadWorkspaceHeader from '$lib/components/clients/leadTabs/LeadWorkspaceHeader.svelte';
	import NoLeadOrganisation from '$lib/components/clients/leadTabs/NoLeadOrganisation.svelte';
	import OrganisationDomainBody from '$lib/components/organisations/domain/OrganisationDomainBody.svelte';
	import { leadTabKeys } from '$lib/components/clients/leadTabs/leadTabs';
	import { organisationDomainMessages } from '$lib/components/organisations/domain/organisationDomainMessages';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { client, organisation, reading } = $derived(data);
	const messages = $derived(organisationDomainMessages(client.name));
</script>

<svelte:head>
	<title>Domain — {client.name} — Your Business Today</title>
</svelte:head>

<LeadWorkspaceHeader company={client} shownTab={leadTabKeys.domain}>
	<p class="text-sm text-chalk-subtle">{messages.introduction}</p>
</LeadWorkspaceHeader>

<div class={workspaceBodyClasses}>
	{#if organisation === null || reading === null}
		<NoLeadOrganisation company={client} />
	{:else}
		<OrganisationDomainBody {organisation} {reading} />
	{/if}
</div>
