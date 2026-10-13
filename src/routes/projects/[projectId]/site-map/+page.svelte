<script lang="ts">
	import AudienceSwitch from '$lib/components/blueprint/AudienceSwitch.svelte';
	import BlueprintHeader from '$lib/components/blueprint/BlueprintHeader.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import McpMapBrowser from '$lib/components/blueprint/McpMapBrowser.svelte';
	import ParitySummary from '$lib/components/blueprint/ParitySummary.svelte';
	import SiteMapBrowser from '$lib/components/blueprint/SiteMapBrowser.svelte';
	import { blueprintEmptyMessages } from '$lib/components/blueprint/blueprintEmptyMessages';
	import { blueprintQueryKeys, linkedValueOf, siteMapAudienceOf, siteMapAudiences } from '$lib/components/blueprint/blueprintViews';
	import { page } from '$app/state';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data, form } = $props();

	const { project, blueprint, goals } = $derived(data);
	const siteMap = $derived(blueprint?.siteMap ?? null);
	const mcpMap = $derived(blueprint?.mcpMap ?? null);
	const audience = $derived(siteMapAudienceOf(page.url));
	const hasNoRepository = $derived(project.repositoryUrl === '');
	const siteMapEmptyMessage = $derived(hasNoRepository ? blueprintEmptyMessages.noRepository : blueprintEmptyMessages.noSiteMap);
	const mcpMapEmptyMessage = $derived(hasNoRepository ? blueprintEmptyMessages.noRepository : blueprintEmptyMessages.noMcpMap);
</script>

<svelte:head>
	<title>Site map — {project.name} — Your Business Today</title>
</svelte:head>

<BlueprintHeader {project} {blueprint} viewKey="site-map" title={`${project.name} site map`} />

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<AudienceSwitch projectId={project.id} {audience} />
	{#if mcpMap !== null}
		<ParitySummary {mcpMap} />
	{/if}
	{#if audience === siteMapAudiences.claude}
		{#if mcpMap === null}
			<EmptyState message={mcpMapEmptyMessage} />
		{:else}
			{@const linkedEntryName = linkedValueOf(page.url, blueprintQueryKeys.entry)}
			<McpMapBrowser {mcpMap} {siteMap} projectId={project.id} {goals} {linkedEntryName} />
		{/if}
	{:else if siteMap === null}
		<EmptyState message={siteMapEmptyMessage} />
	{:else}
		{@const linkedRoute = linkedValueOf(page.url, blueprintQueryKeys.screen)}
		<SiteMapBrowser {siteMap} {mcpMap} projectId={project.id} {goals} {linkedRoute} />
	{/if}
</div>
