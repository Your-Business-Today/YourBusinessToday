<script lang="ts">
	import BusinessBrainChatbotsPanel from '$lib/components/businessBrain/BusinessBrainChatbotsPanel.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import OrganisationPageHeader from '$lib/components/organisations/OrganisationPageHeader.svelte';
	import ProductDomainPanel from '$lib/components/organisations/productDomains/ProductDomainPanel.svelte';
	import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { organisation, canManage, brains, productDomains } = $derived(data);
	const addresses = $derived(businessBrainAddresses(organisation.id));
</script>

<svelte:head>
	<title>Domain — {organisation.name} — Your Business Today</title>
</svelte:head>

<OrganisationPageHeader {organisation}>
	<p class="text-sm text-chalk-subtle">
		What {organisation.name} knows: its brains, and the business domain of every product as last read from its repository.
	</p>
</OrganisationPageHeader>

<div class={workspaceBodyClasses}>
	{#if brains !== null}
		<BusinessBrainChatbotsPanel chatbots={brains} {canManage} {addresses} isBrainLinked={true} />
	{/if}
	{#each productDomains as productDomain (productDomain.projectId)}
		<ProductDomainPanel {productDomain} />
	{:else}
		<EmptyState message={`No products of ${organisation.name} are open to you yet.`} />
	{/each}
</div>
