<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import LineMap from '$lib/components/lineMap/LineMap.svelte';
	import WorkflowMapLegend from './WorkflowMapLegend.svelte';
	import type { LegendItem } from './workflowMapLegend';
	import type { LineMapLayout } from '$lib/components/lineMap/layout/lineMapLayout';
	import type { LineMapModel } from '$lib/components/lineMap/layout/lineMapModel';

	let {
		map,
		label,
		legendItems,
		layout,
		selectedStationId,
		litStationIds,
		onChooseStation
	}: {
		map: LineMapModel;
		label: string;
		legendItems: LegendItem[];
		layout: LineMapLayout;
		selectedStationId?: string;
		litStationIds?: string[];
		onChooseStation: (stationId: string) => void;
	} = $props();
</script>

<DashboardPanel id="workflow-map-panel">
	<div class="px-4 py-6 sm:px-6">
		<LineMap {map} {label} {layout} {selectedStationId} {litStationIds} {onChooseStation} />
	</div>
	<div class="border-t border-hairline px-4 py-4 sm:px-6">
		<WorkflowMapLegend items={legendItems} />
	</div>
</DashboardPanel>
