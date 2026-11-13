<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import WorkflowMapView from '$lib/components/organisations/workflowMap/WorkflowMapView.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { companyPagePath, registerOfStage } from '$lib/data/salesRegisters';
	import { companyWorkflowMapMessages } from '$lib/components/clients/companyWorkflowMapWords';
	import { openingStageOf } from '$lib/components/organisations/workflowMap/workflowMapTabs';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { StationDomain } from '$lib/data/domainReading';

	let { data } = $props();

	const domainNotShownHere: StationDomain = { thingTitles: {}, rules: [] };

	const { client, maps, chosenStationKey } = $derived(data);
	const register = $derived(registerOfStage(client.stage));
	const crumbs = $derived([
		{ label: register.title, href: register.path },
		{ label: client.name, href: companyPagePath(client) }
	]);
	const messages = $derived(companyWorkflowMapMessages(client.name));
	const openingStage = $derived(maps === null ? null : openingStageOf(maps));
</script>

<svelte:head>
	<title>Workflow map — {client.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader {crumbs} title="Workflow map">
	<p class="text-sm text-chalk-subtle">{messages.introduction}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	{#if maps === null || openingStage === null}
		<EmptyState message={messages.noMap} />
	{:else}
		<WorkflowMapView {maps} {openingStage} {chosenStationKey} {messages} stationDomain={domainNotShownHere} organisationId={null} />
	{/if}
</div>
