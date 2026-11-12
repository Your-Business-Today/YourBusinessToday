<script lang="ts">
	import BusinessBrainIndexPanel from '$lib/components/businessBrain/BusinessBrainIndexPanel.svelte';
	import BlueprintHeader from '$lib/components/blueprint/BlueprintHeader.svelte';
	import DomainExplorer from '$lib/components/blueprint/DomainExplorer.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import { blueprintEmptyMessages } from '$lib/components/blueprint/blueprintEmptyMessages';
	import { blueprintQueryKeys, linkedValueOf } from '$lib/components/blueprint/blueprintViews';
	import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import { page } from '$app/state';
	import { productBrainEmptyMessage } from '$lib/components/businessBrain/productBrainMessages';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data, form } = $props();

	const { project, blueprint, goals, productBrain } = $derived(data);
	const domain = $derived(blueprint?.domain ?? null);
	const emptyMessage = $derived(
		project.repositoryUrl === '' ? blueprintEmptyMessages.noRepository : blueprintEmptyMessages.noDomain
	);
</script>

<svelte:head>
	<title>Domain — {project.name} — Your Business Today</title>
</svelte:head>

<BlueprintHeader {project} {blueprint} />

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	{#if productBrain !== null}
		<BusinessBrainIndexPanel
			title="Product brain"
			index={productBrain.index}
			addresses={businessBrainAddresses(productBrain.organisationId)}
			emptyMessage={productBrainEmptyMessage(productBrain.parts)}
		/>
	{/if}
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
