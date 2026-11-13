<script lang="ts">
	import ProductStationStateLine from './ProductStationStateLine.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { lineSwatchClasses } from '$lib/components/organisations/workflowMap/lineSwatchClasses';
	import { productStationColumns } from './productWorkflowMapWords';
	import type { ProductStation } from './productStations';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { stations }: { stations: ProductStation[] } = $props();

	const columns: RecordsColumn<ProductStation>[] = [
		{ key: 'station', label: productStationColumns.station, sortValue: (station) => station.name },
		{ key: 'role', label: productStationColumns.role, sortValue: (station) => station.roleName },
		{ key: 'takesIn', label: productStationColumns.takesIn },
		{ key: 'produces', label: productStationColumns.produces },
		{ key: 'state', label: productStationColumns.state, sortValue: (station) => station.state }
	];
</script>

<RecordsTable label="The stations this product runs" {columns} rows={stations} keyOf={(station) => station.key} isCardsOnPhone>
	{#snippet cells(station)}
		<RecordsCell>{station.name}</RecordsCell>
		<RecordsCell label={productStationColumns.role}>
			<span class="flex items-center gap-2">
				<span class="h-1.5 w-3 shrink-0 rounded-full {lineSwatchClasses[station.roleColour]}" aria-hidden="true"></span>
				{station.roleName}
			</span>
		</RecordsCell>
		<RecordsCell label={productStationColumns.takesIn}>{station.takesIn}</RecordsCell>
		<RecordsCell label={productStationColumns.produces}>{station.produces}</RecordsCell>
		<RecordsCell label={productStationColumns.state}><ProductStationStateLine state={station.state} /></RecordsCell>
	{/snippet}
</RecordsTable>
