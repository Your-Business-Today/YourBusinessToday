<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import ProductStationsTable from './ProductStationsTable.svelte';
	import WorkflowMapPanel from '$lib/components/organisations/workflowMap/WorkflowMapPanel.svelte';
	import { drawnWorkflowMapsOf } from '$lib/components/organisations/workflowMap/drawnWorkflowMaps';
	import { estimatedTextWidth, loadedTextMeasure, type MeasureText } from '$lib/components/lineMap/layout/textMeasure';
	import { productLegendItemsOf } from '$lib/components/organisations/workflowMap/workflowMapLegend';
	import { productStationsOf } from './productStations';
	import { workflowMapStationHref } from '$lib/components/organisations/organisationPages';
	import type { MapStage } from '$lib/data/workflowMap/workflowMap';
	import type { OrganisationWorkflowMaps } from '$lib/data/workflowMap/organisationWorkflowMaps';

	let {
		organisationId,
		productId,
		maps,
		stage,
		messages
	}: {
		organisationId: string;
		productId: string;
		maps: OrganisationWorkflowMaps;
		stage: MapStage;
		messages: { runsNoStation: string; mapLabel: string };
	} = $props();

	let measure: MeasureText = $state(estimatedTextWidth);

	onMount(() => {
		loadedTextMeasure().then((loaded) => (measure = loaded));
	});

	const drawn = $derived(drawnWorkflowMapsOf(maps, measure));
	const shownMap = $derived(maps[stage]);
	const shownLineMap = $derived(drawn.lineMaps[stage]);
	const stations = $derived(shownMap === null ? [] : productStationsOf(shownMap, productId, drawn.colours));
	const litStationIds = $derived(stations.map((station) => station.key));

	function openOnOrganisationMap(stationKey: string): void {
		goto(workflowMapStationHref(organisationId, stationKey));
	}
</script>

{#if stations.length === 0 || shownLineMap === null}
	<EmptyState message={messages.runsNoStation} />
{:else}
	<WorkflowMapPanel
		map={shownLineMap}
		label={messages.mapLabel}
		legendItems={productLegendItemsOf(shownMap)}
		layout={drawn.layout}
		{litStationIds}
		onChooseStation={openOnOrganisationMap}
	/>
	<DashboardPanel>
		<ProductStationsTable {stations} />
	</DashboardPanel>
{/if}
