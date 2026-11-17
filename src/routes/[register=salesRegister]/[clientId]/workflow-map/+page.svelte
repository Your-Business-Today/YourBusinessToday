<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import WorkflowMapView from '$lib/components/organisations/workflowMap/WorkflowMapView.svelte';
	import LeadWorkspaceHeader from '$lib/components/clients/leadTabs/LeadWorkspaceHeader.svelte';
	import NoLeadOrganisation from '$lib/components/clients/leadTabs/NoLeadOrganisation.svelte';
	import { leadTabKeys } from '$lib/components/clients/leadTabs/leadTabs';
	import { companyWorkflowMapMessages } from '$lib/components/clients/companyWorkflowMapWords';
	import { openingStageOf } from '$lib/components/organisations/workflowMap/workflowMapTabs';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { emptyVocabulary } from '$lib/data/workflowMap/phraseInDomain';
	import type { StationDomain } from '$lib/data/domainReading';

	let { data } = $props();

	const domainNotShownHere: StationDomain = { vocabulary: emptyVocabulary, rules: [] };

	const { client, hasOrganisation, maps, chosenStationKey } = $derived(data);
	const messages = $derived(companyWorkflowMapMessages(client.name));
	const openingStage = $derived(maps === null ? null : openingStageOf(maps));
</script>

<svelte:head>
	<title>Workflow map — {client.name} — Your Business Today</title>
</svelte:head>

<LeadWorkspaceHeader company={client} shownTab={leadTabKeys.workflowMap}>
	<p class="text-sm text-chalk-subtle">{messages.introduction}</p>
</LeadWorkspaceHeader>

<div class={workspaceBodyClasses}>
	{#if !hasOrganisation}
		<NoLeadOrganisation company={client} />
	{:else if maps === null || openingStage === null}
		<EmptyState message={messages.noMap} />
	{:else}
		<WorkflowMapView {maps} {openingStage} {chosenStationKey} {messages} stationDomain={domainNotShownHere} organisationId={null} />
	{/if}
</div>
