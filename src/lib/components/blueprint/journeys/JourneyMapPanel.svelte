<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import LineMap from '$lib/components/lineMap/LineMap.svelte';
	import JourneyLegend from './JourneyLegend.svelte';
	import type { LineMapModel } from '$lib/components/lineMap/layout/lineMapModel';

	let {
		map,
		projectId,
		roles,
		chosenRole,
		selectedStationId,
		onChooseStation
	}: {
		map: LineMapModel;
		projectId: string;
		roles: string[];
		chosenRole: string;
		selectedStationId: string | undefined;
		onChooseStation: (stationId: string) => void;
	} = $props();

	const label = $derived(`The journeys of ${chosenRole} through the views`);
</script>

<DashboardPanel id="journey-map-panel">
	<div class="px-4 py-6 sm:px-6">
		<LineMap {map} {label} {selectedStationId} {onChooseStation} />
	</div>
	<div class="border-t border-hairline px-4 py-4 sm:px-6">
		<JourneyLegend {projectId} {roles} {chosenRole} />
	</div>
</DashboardPanel>
