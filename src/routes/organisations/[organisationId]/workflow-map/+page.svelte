<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import WorkflowMapView from '$lib/components/organisations/workflowMap/WorkflowMapView.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';
	import { openingStageOf } from '$lib/components/organisations/workflowMap/workflowMapTabs';
	import { workflowMapMessages } from '$lib/components/organisations/workflowMap/workflowMapWords';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const workflowMapTitle = framePageLabels.workflowMap;
	const { organisation, maps, chosenStationKey, stationDomain } = $derived(data);
	const messages = $derived(workflowMapMessages(organisation.name));
	const openingStage = $derived(maps === null ? null : openingStageOf(maps));
</script>

<svelte:head>
	<title>{workflowMapTitle} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={workflowMapTitle}>
	<p class="text-sm text-chalk-subtle">{messages.introduction}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	{#if maps === null}
		<EmptyState message={messages.brainClosed} />
	{:else if openingStage === null || stationDomain === null}
		<EmptyState message={messages.noMap} />
	{:else}
		<WorkflowMapView {maps} {openingStage} {chosenStationKey} {messages} {stationDomain} organisationId={organisation.id} />
	{/if}
</div>
