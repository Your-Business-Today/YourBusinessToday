<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import OrganisationPageHeader from '$lib/components/organisations/OrganisationPageHeader.svelte';
	import ProductDomainPanel from '$lib/components/organisations/productDomains/ProductDomainPanel.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { organisation, productDomains } = $derived(data);
</script>

<svelte:head>
	<title>Domain — {organisation.name} — Your Business Today</title>
</svelte:head>

<OrganisationPageHeader {organisation}>
	<p class="text-sm text-chalk-subtle">The business domain of every product of {organisation.name}, as last read from each repository.</p>
</OrganisationPageHeader>

<div class={workspaceBodyClasses}>
	{#each productDomains as productDomain (productDomain.projectId)}
		<ProductDomainPanel {productDomain} />
	{:else}
		<EmptyState message={`No products of ${organisation.name} are open to you yet.`} />
	{/each}
</div>
