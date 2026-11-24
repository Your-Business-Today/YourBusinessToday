<script lang="ts">
	import BrandAwaitingTable from '$lib/components/brand/BrandAwaitingTable.svelte';
	import BrandCampaignTable from '$lib/components/brand/BrandCampaignTable.svelte';
	import BrandKitPanels from '$lib/components/brand/BrandKitPanels.svelte';
	import ProductBrandTable from '$lib/components/brand/ProductBrandTable.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { brandKitCrumbsFor } from '$lib/components/brand/brandKitPageWords';
	import { brandLibraryPathOf } from '$lib/brand/library/libraryWords';
	import { contentPlanPathOf } from '$lib/components/brand/contentPlanPageWords';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { brandOrganisation: organisation, kit, awaitingApproval, campaigns, products } = $derived(data);
</script>

<svelte:head>
	<title>Brand kit — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={brandKitCrumbsFor(organisation)} title="Brand kit">
	{#snippet actions()}
		<Button href={contentPlanPathOf(organisation.id)}>The month’s plan</Button>
		<Button href={brandLibraryPathOf(organisation.id)}>Photos and videos</Button>
	{/snippet}
	<p class="text-sm text-chalk-muted">
		{organisation.name}’s brand as it holds everywhere, and why each part was decided. Your Claude changes it through the
		Your Business Today connector; this page shows it.
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<BrandKitPanels {kit}>
		{#snippet beforeKit()}
			<DashboardPanel title="Waiting for approval" count={awaitingApproval.length}>
				<BrandAwaitingTable organisationId={organisation.id} pieces={awaitingApproval} />
			</DashboardPanel>
		{/snippet}
		{#snippet afterKit()}
			<DashboardPanel title="Products with a brand of their own" count={products.length}>
				<ProductBrandTable organisationId={organisation.id} {products} />
			</DashboardPanel>
			<DashboardPanel title="Paid campaigns" count={campaigns.length}>
				<BrandCampaignTable organisationId={organisation.id} {campaigns} />
			</DashboardPanel>
		{/snippet}
	</BrandKitPanels>
</div>
