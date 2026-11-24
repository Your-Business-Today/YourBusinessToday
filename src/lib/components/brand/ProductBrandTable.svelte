<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { productBrandPathOf, type ProductBrand } from '$lib/brand/products/productBrand';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { organisationId, products }: { organisationId: string; products: ProductBrand[] } = $props();

	const columns: RecordsColumn<ProductBrand>[] = [
		{ key: 'product', label: 'Product', sortValue: (product) => product.projectName },
		{ key: 'summary', label: 'What the brand is', isWideOnly: true, sortValue: (product) => product.summary }
	];

	const pageOf = (product: ProductBrand) => productBrandPathOf(organisationId, product.projectId);
</script>

<div class="overflow-x-auto">
	<RecordsTable
		label="Products with a brand of their own"
		{columns}
		rows={products}
		keyOf={(product) => product.projectId}
		hrefOf={pageOf}
		emptyMessage="No product has a brand of its own yet. Each one follows this brand."
	>
		{#snippet cells(product)}
			<RecordsCell kind="link" href={pageOf(product)}>{product.projectName}</RecordsCell>
			<RecordsCell isWideOnly>{product.summary}</RecordsCell>
		{/snippet}
	</RecordsTable>
</div>
