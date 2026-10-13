<script lang="ts">
	import BlueprintHeader from '$lib/components/blueprint/BlueprintHeader.svelte';
	import DomainExplorer from '$lib/components/blueprint/DomainExplorer.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import { blueprintEmptyMessages } from '$lib/components/blueprint/blueprintEmptyMessages';
	import { blueprintQueryKeys, linkedValueOf } from '$lib/components/blueprint/blueprintViews';
	import { page } from '$app/state';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data, form } = $props();

	const { project, blueprint, goals } = $derived(data);
	const domain = $derived(blueprint?.domain ?? null);
	const emptyMessage = $derived(
		project.repositoryUrl === '' ? blueprintEmptyMessages.noRepository : blueprintEmptyMessages.noDomain
	);
</script>

<svelte:head>
	<title>Domain — {project.name} — Your Business Today</title>
</svelte:head>

<BlueprintHeader {project} {blueprint} viewKey="domain" title={`${project.name} domain`} />

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	{#if domain === null}
		<EmptyState message={emptyMessage} />
	{:else}
		<DomainExplorer
			{domain}
			siteMap={blueprint?.siteMap ?? null}
			projectId={project.id}
			{goals}
			linkedEntityName={linkedValueOf(page.url, blueprintQueryKeys.entity)}
		/>
	{/if}
</div>
