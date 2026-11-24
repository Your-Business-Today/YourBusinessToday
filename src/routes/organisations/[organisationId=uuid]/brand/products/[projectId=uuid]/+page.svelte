<script lang="ts">
	import BrandKitPanels from '$lib/components/brand/BrandKitPanels.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { brandCrumbsFor } from '$lib/components/brand/brandKitPageWords';
	import { productBrandIntroOf } from '$lib/brand/products/productBrandWords';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { brandOrganisation: organisation, product, kit, summary } = $derived(data);
</script>

<svelte:head>
	<title>Brand kit — {product.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={brandCrumbsFor(organisation)} title="{product.name} brand kit">
	<p class="text-sm text-chalk-muted">{productBrandIntroOf(organisation.name, product.name, summary)}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<BrandKitPanels {kit} />
</div>
