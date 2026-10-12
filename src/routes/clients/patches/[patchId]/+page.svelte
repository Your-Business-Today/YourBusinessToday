<script lang="ts">
	import CoverageStrip from '$lib/components/clients/patches/CoverageStrip.svelte';
	import LeadOutcomeNote from '$lib/components/clients/map/LeadOutcomeNote.svelte';
	import PatchHeader from '$lib/components/clients/patches/PatchHeader.svelte';
	import PatchMapPane from '$lib/components/clients/patches/PatchMapPane.svelte';
	import PatchSidebar from '$lib/components/clients/patches/PatchSidebar.svelte';
	import PatchSummary from '$lib/components/clients/patches/PatchSummary.svelte';
	import { drawnSectorsOf } from '$lib/components/clients/patches/drawnSectors';
	import type { Building } from '$lib/server/buildings/buildingRecord';

	let { data, form } = $props();

	const { patch, map, coverage } = $derived(data);

	const nearestListed = 300;

	let selectedKey = $state<string | null>(null);
	let selectedSector = $state<string | null>(null);
	let selectedBuilding = $state<Building | null>(null);

	const listedPins = $derived(map?.pins.slice(0, nearestListed) ?? []);
	const drawnSectors = $derived(drawnSectorsOf(coverage.sectors, coverage.coverage, data.accountNames));

	function selectPin(key: string) {
		selectedKey = key;
		selectedSector = null;
		selectedBuilding = null;
	}

	function pickSector(sector: string) {
		selectedSector = sector;
		selectedKey = null;
		selectedBuilding = null;
	}

	function pickBuilding(building: Building) {
		selectedBuilding = building;
		selectedKey = null;
		selectedSector = null;
	}
</script>

<svelte:head>
	<title>{patch.name} — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16">
	<PatchHeader {patch} ownerName={data.ownerName} watchers={data.watchers} />
	<LeadOutcomeNote message={data.notice ?? form?.message ?? null} clientId={form?.clientId} />
	<CoverageStrip counts={coverage.counts} />
	{#if map !== null}
		<PatchSummary {map} listedCount={nearestListed} />
		<div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
			<PatchMapPane
				patchId={patch.id}
				centre={map.centre}
				radiusMiles={map.radiusMiles}
				pins={map.pins}
				sectors={drawnSectors}
				{selectedKey}
				{selectedSector}
				selectedBuildingId={selectedBuilding?.id ?? null}
				onSelect={selectPin}
				onPickSector={pickSector}
				onPickBuilding={pickBuilding}
			/>
			<PatchSidebar
				patchId={patch.id}
				pins={map.pins}
				{listedPins}
				{coverage}
				searches={data.searches}
				sightings={data.sightings}
				premises={map.premises}
				figures={map.figuresByCompanyNumber}
				buildingCounts={data.buildingCounts}
				accountNames={data.accountNames}
				{selectedKey}
				{selectedSector}
				{selectedBuilding}
				onSelect={selectPin}
			/>
		</div>
	{/if}
</div>
