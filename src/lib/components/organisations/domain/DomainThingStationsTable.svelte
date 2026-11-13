<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { thingStationRoleWords, type ThingStation } from '$lib/data/workflowMap/thingStations';
	import { workflowMapStationHref } from '$lib/components/organisations/organisationPages';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { stations, organisationId }: { stations: ThingStation[]; organisationId: string } = $props();

	const hrefOf = (station: ThingStation) => workflowMapStationHref(organisationId, station.stationKey);

	const columns: RecordsColumn<ThingStation>[] = [
		{ key: 'station', label: 'Station' },
		{ key: 'line', label: 'Role' },
		{ key: 'role', label: 'With it' }
	];
</script>

<RecordsTable
	label="Stations"
	{columns}
	rows={stations}
	keyOf={(station) => `${station.stationKey}:${station.role}`}
	{hrefOf}
	isDense
	isCardsOnPhone
	emptyMessage="No station of today's workflow map takes it in or produces it."
>
	{#snippet cells(station)}
		<RecordsCell kind="link" href={hrefOf(station)}>{station.stationName}</RecordsCell>
		<RecordsCell label="Role">{station.lineName}</RecordsCell>
		<RecordsCell label="With it">{thingStationRoleWords[station.role]}</RecordsCell>
	{/snippet}
</RecordsTable>
