<script lang="ts">
	import AreaCompanyList from '$lib/components/clients/map/AreaCompanyList.svelte';
	import AreaCompanyPanel from '$lib/components/clients/map/AreaCompanyPanel.svelte';
	import SectorPanel from './SectorPanel.svelte';
	import { sectorOf } from '$lib/data/postcode';
	import type { AreaPin } from '$lib/server/clients/area/areaPin';
	import type { PatchCoverage } from '$lib/server/sectors/patchCoverage';
	import type { RecordedSectorSearch } from '$lib/server/sectors/sectorSearchRecord';

	let {
		patchId,
		pins,
		listedPins,
		coverage,
		searches,
		accountNames,
		selectedKey,
		selectedSector,
		onSelect
	}: {
		patchId: string;
		pins: AreaPin[];
		listedPins: AreaPin[];
		coverage: PatchCoverage;
		searches: RecordedSectorSearch[];
		accountNames: Record<string, string>;
		selectedKey: string | null;
		selectedSector: string | null;
		onSelect: (key: string) => void;
	} = $props();

	const selectedPin = $derived(pins.find((pin) => pin.key === selectedKey) ?? null);
	const sector = $derived(coverage.sectors.find((candidate) => candidate.sector === selectedSector) ?? null);
	const sectorCoverage = $derived(coverage.coverage.find((candidate) => candidate.sector === selectedSector) ?? null);
	const sectorSearches = $derived(searches.filter((search) => search.sector === selectedSector));
	const sectorCompanyCount = $derived(
		pins.filter((pin) => sectorOf(pin.postcode) === selectedSector).reduce((count, pin) => count + pin.companyCount, 0)
	);
</script>

<div class="flex flex-col gap-4">
	{#if sector !== null && sectorCoverage !== null}
		<SectorPanel {patchId} {sector} coverage={sectorCoverage} searches={sectorSearches} companyCount={sectorCompanyCount} {accountNames} />
	{:else}
		<AreaCompanyPanel pin={selectedPin} addLeadAction="?/addLead" addWithDirectorsAction="?/addLeadWithDirectors" />
	{/if}
	<AreaCompanyList pins={listedPins} {selectedKey} {onSelect} />
</div>
