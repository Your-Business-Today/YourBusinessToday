<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import LineMap from '$lib/components/lineMap/LineMap.svelte';
	import WorkflowMapLegend from './WorkflowMapLegend.svelte';
	import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
	import type { LineMapLayout } from '$lib/components/lineMap/layout/lineMapLayout';
	import type { LineMapModel } from '$lib/components/lineMap/layout/lineMapModel';
	import type { MapStage } from '$lib/data/workflowMap/workflowMap';

	let {
		map,
		stage,
		layout,
		selectedStationId,
		onChooseStation
	}: {
		map: LineMapModel;
		stage: MapStage;
		layout: LineMapLayout;
		selectedStationId: string | undefined;
		onChooseStation: (stationId: string) => void;
	} = $props();

	const label = $derived(`The workflow map, ${mapStageNames[stage]}`);
</script>

<DashboardPanel id="workflow-map-panel">
	<div class="px-4 py-6 sm:px-6">
		<LineMap {map} {label} {layout} {selectedStationId} {onChooseStation} />
	</div>
	<div class="border-t border-hairline px-4 py-4 sm:px-6">
		<WorkflowMapLegend {stage} />
	</div>
</DashboardPanel>
