<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import PortalStationReview from '$lib/components/portal/workflowMap/PortalStationReview.svelte';
	import WorkflowMapView from '$lib/components/organisations/workflowMap/WorkflowMapView.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { openingStageOf } from '$lib/components/organisations/workflowMap/workflowMapTabs';
	import { portalHomePath } from '$lib/portal/portalPaths';
	import { portalWorkflowMapMessages } from '$lib/components/portal/workflowMap/portalWorkflowMapWords';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { StationDomain } from '$lib/data/domainReading';

	let { data } = $props();

	const domainNotShownInThePortal: StationDomain = { thingTitles: {}, rules: [] };

	const { visitor, reading, chosenStationKey } = $derived(data);
	const crumbs = $derived([{ label: visitor.organisationName, href: portalHomePath }]);
	const messages = $derived(portalWorkflowMapMessages(visitor.organisationName));
	const openingStage = $derived(reading === null ? null : openingStageOf(reading.maps));
</script>

<svelte:head>
	<title>Your workflow map — {visitor.organisationName} — Client portal</title>
</svelte:head>

<WorkspaceHeader {crumbs} title="Your workflow map">
	<p class="text-sm text-chalk-subtle">{messages.introduction}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	{#if reading === null || openingStage === null}
		<EmptyState message={messages.noMap} />
	{:else}
		<WorkflowMapView
			maps={reading.maps}
			{openingStage}
			{chosenStationKey}
			{messages}
			stationDomain={domainNotShownInThePortal}
			organisationId={null}
		>
			{#snippet belowStation(map, stationKey)}
				<PortalStationReview {map} {stationKey} standings={reading.standings[map.stage]} />
			{/snippet}
		</WorkflowMapView>
	{/if}
</div>
