<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import ProductWorkflowMapView from '$lib/components/projects/workflowMap/ProductWorkflowMapView.svelte';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';
	import { noOrganisationMessage, productWorkflowMapMessages } from '$lib/components/projects/workflowMap/productWorkflowMapWords';
	import { openingStageOf } from '$lib/components/organisations/workflowMap/workflowMapTabs';
	import { productMapReadings } from '$lib/data/workflowMap/productMapReading';
	import { workflowMapMessages } from '$lib/components/organisations/workflowMap/workflowMapWords';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const workflowMapTitle = framePageLabels.workflowMap;
	const { project, reading } = $derived(data);
	const organisationName = $derived(reading.kind === productMapReadings.noOrganisation ? '' : reading.organisationName);
	const organisationMessages = $derived(workflowMapMessages(organisationName));
	const productMessages = $derived(productWorkflowMapMessages(project.name, organisationName));
	const openingStage = $derived(reading.kind === productMapReadings.read ? openingStageOf(reading.maps) : null);
</script>

<svelte:head>
	<title>{workflowMapTitle} — {project.name} — Your Business Today</title>
</svelte:head>

<ProjectPageHeader {project} />

<div class={workspaceBodyClasses}>
	{#if reading.kind === productMapReadings.noOrganisation}
		<EmptyState message={noOrganisationMessage} />
	{:else if reading.kind === productMapReadings.brainClosed}
		<EmptyState message={organisationMessages.brainClosed} />
	{:else if openingStage === null}
		<EmptyState message={organisationMessages.noMap} />
	{:else}
		<ProductWorkflowMapView
			organisationId={reading.organisationId}
			productId={project.id}
			maps={reading.maps}
			stage={openingStage}
			messages={productMessages}
		/>
	{/if}
</div>
