<script lang="ts">
	import DevelopmentTabs from '$lib/components/projects/DevelopmentTabs.svelte';
	import { developmentPages } from '$lib/components/projects/developmentPages';
	import BlueprintHeader from '$lib/components/blueprint/BlueprintHeader.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import JourneySiteMap from '$lib/components/blueprint/journeys/JourneySiteMap.svelte';
	import ParitySummary from '$lib/components/blueprint/ParitySummary.svelte';
	import { journeySiteMapMessages, journeysDrawnFrom } from '$lib/components/blueprint/journeys/journeySiteMapWords';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data, form } = $props();

	const { project, blueprint, goals, journeyMap } = $derived(data);
	const siteMap = $derived(blueprint?.siteMap ?? null);
	const mcpMap = $derived(blueprint?.mcpMap ?? null);
	const drawnFrom = $derived(journeyMap === null ? null : journeysDrawnFrom(journeyMap));
</script>

<svelte:head>
	<title>Site map — {project.name} — Your Business Today</title>
</svelte:head>

<BlueprintHeader {project} {blueprint} {drawnFrom} />

<div class={workspaceBodyClasses}>
	<DevelopmentTabs projectId={project.id} selected={developmentPages.siteMap} counts={data.developmentTabCounts} />
	<FlashMessage message={form?.message} />
	{#if mcpMap !== null}
		<ParitySummary {mcpMap} />
	{/if}
	{#if journeyMap === null}
		<EmptyState message={journeySiteMapMessages.noJourneys} />
	{:else}
		<JourneySiteMap {journeyMap} {siteMap} {mcpMap} projectId={project.id} {goals} />
	{/if}
</div>
