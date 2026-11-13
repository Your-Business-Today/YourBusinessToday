<script lang="ts">
	import { onMount } from 'svelte';
	import { layoutLineMap } from './layout/layoutLineMap';
	import type { LineMapLayout } from './layout/lineMapLayout';
	import type { LineMapModel } from './layout/lineMapModel';
	import { estimatedTextWidth, loadedTextMeasure, type MeasureText } from './layout/textMeasure';
	import { drawingOf } from './lineMapDrawing';
	import LineMapLineName from './LineMapLineName.svelte';
	import LineMapStation from './LineMapStation.svelte';
	import LineMapTracks from './LineMapTracks.svelte';

	let {
		map,
		label,
		layout,
		selectedStationId,
		litStationIds,
		onChooseStation
	}: {
		map: LineMapModel;
		label: string;
		layout?: LineMapLayout;
		selectedStationId?: string;
		litStationIds?: string[];
		onChooseStation?: (stationId: string) => void;
	} = $props();

	let measure: MeasureText = $state(estimatedTextWidth);

	onMount(() => {
		loadedTextMeasure().then((loaded) => (measure = loaded));
	});

	const drawnLayout = $derived(layout ?? layoutLineMap(map, { measure }));
	const drawing = $derived(drawingOf(map, drawnLayout, { selectedStationId, litStationIds }));
	const { width, height, geometry } = $derived(drawnLayout);
</script>

<div class="flex overflow-x-auto">
	<svg class="mx-auto shrink-0" viewBox="0 0 {width} {height}" {width} {height} role="group" aria-label={label}>
		<LineMapTracks {drawing} {geometry} isDimmed={litStationIds !== undefined} />
		{#each drawing.lineNames as lineName (lineName.lineId)}
			<LineMapLineName {lineName} />
		{/each}
		{#each drawing.stations as station (station.id)}
			<LineMapStation {station} onChoose={onChooseStation} />
		{/each}
	</svg>
</div>
