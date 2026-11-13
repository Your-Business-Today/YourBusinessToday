<script lang="ts">
	import { onMount } from 'svelte';
	import { layoutLineMap } from './layout/layoutLineMap';
	import type { LineMapLayout } from './layout/lineMapLayout';
	import type { LineMapModel } from './layout/lineMapModel';
	import { estimatedTextWidth, loadedTextMeasure, type MeasureText } from './layout/textMeasure';
	import { rowBreaks } from './lineMapContinuations';
	import { drawingOf, runKey } from './lineMapDrawing';
	import LineMapLineName from './LineMapLineName.svelte';
	import LineMapStation from './LineMapStation.svelte';
	import LineMapTracks from './LineMapTracks.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import { lineMapSizeWords } from './lineMapSizeWords';

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
	let panelWidth = $state(0);
	let isFullSize = $state(false);

	onMount(() => {
		loadedTextMeasure().then((loaded) => (measure = loaded));
	});

	const drawnLayout = $derived(layout ?? layoutLineMap(map, { measure }));
	const drawing = $derived(drawingOf(map, drawnLayout, { selectedStationId, litStationIds }));
	const { width, height, geometry } = $derived(drawnLayout);
	const isWiderThanPanel = $derived(panelWidth > 0 && width > panelWidth);
	const isFitted = $derived(isWiderThanPanel && !isFullSize);
</script>

{#if isWiderThanPanel}
	<div class="mb-3 flex justify-end">
		<Button onclick={() => (isFullSize = !isFullSize)}>
			{isFullSize ? lineMapSizeWords.fitToPanel : lineMapSizeWords.fullSize}
		</Button>
	</div>
{/if}
<div class="flex overflow-x-auto" bind:clientWidth={panelWidth}>
	<svg
		class={isFitted ? 'h-auto w-full' : 'mx-auto shrink-0'}
		viewBox="0 0 {width} {height}"
		width={isFitted ? undefined : width}
		height={isFitted ? undefined : height}
		role="group"
		aria-label={label}
	>
		{#each rowBreaks(drawnLayout.rows) as top (top)}
			<path d="M0 {top}H{width}" class="stroke-hairline" stroke-width="1" stroke-dasharray="4 6" />
		{/each}
		<LineMapTracks {drawing} {geometry} isDimmed={litStationIds !== undefined} />
		{#each drawing.lineNames as lineName (runKey(lineName))}
			<LineMapLineName {lineName} />
		{/each}
		{#each drawing.stations as station (station.id)}
			<LineMapStation {station} onChoose={onChooseStation} />
		{/each}
	</svg>
</div>
