<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { productStageNames, productWords, stepsListed } from '$lib/data/workflowMap/productAndLoopWords';
	import type { MapProduct, ProductStep } from '$lib/data/workflowMap/productsOnTheMap';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { products }: { products: MapProduct[] } = $props();

	const columns: RecordsColumn<MapProduct>[] = [
		{ key: 'product', label: productWords.product, sortValue: (product) => product.name },
		{ key: 'stage', label: productWords.stage, sortValue: (product) => product.stage },
		{ key: 'steps', label: productWords.steps },
		{ key: 'fixes', label: productWords.fixes }
	];

	function stepOnItsLine({ stationName, lineName }: ProductStep): string {
		return `${stationName} (${lineName})`;
	}
</script>

<RecordsTable label={productWords.label} {columns} rows={products} keyOf={(product) => product.name} isCardsOnPhone emptyMessage={productWords.noProducts}>
	{#snippet cells(product)}
		<RecordsCell>{product.name}</RecordsCell>
		<RecordsCell label={productWords.stage}>{productStageNames[product.stage]}</RecordsCell>
		<RecordsCell label={productWords.steps}>{stepsListed(product.steps.map(stepOnItsLine), productWords.noSteps)}</RecordsCell>
		<RecordsCell label={productWords.fixes}>{stepsListed(product.fixes, productWords.nothingGoesWrong)}</RecordsCell>
	{/snippet}
</RecordsTable>
