<script lang="ts">
	import type { DrawnStation } from './drawnStations';
	import { returnArrowPath } from './lineMapPaths';
	import StationMark from './StationMark.svelte';
	import { focusRingRadius, goingBackMarkAt, isChoosingKey, labelClassesOf, labelLineY, stationDescription } from './stationMarks';

	let { station, onChoose }: { station: DrawnStation; onChoose?: (stationId: string) => void } = $props();

	const { place, label } = $derived(station);
	const ringRadius = $derived(focusRingRadius(station));
	const goingBackAt = $derived(goingBackMarkAt(station));

	function choose(): void {
		onChoose?.(station.id);
	}

	function chooseByKey(event: KeyboardEvent): void {
		if (!isChoosingKey(event)) return;
		event.preventDefault();
		choose();
	}
</script>

<g
	role="button"
	tabindex="0"
	aria-label={stationDescription(station)}
	aria-pressed={station.isSelected}
	class="group cursor-pointer outline-none {station.isDimmed ? 'opacity-40' : ''}"
	onclick={choose}
	onkeydown={chooseByKey}
>
	<StationMark {station} />
	<circle cx={place.x} cy={place.y} r={ringRadius + 3} class="fill-none stroke-go opacity-0 group-focus-visible:opacity-100" stroke-width="2" />
	{#if station.isSelected}
		<circle cx={place.x} cy={place.y} r={ringRadius} class="fill-none stroke-chalk" stroke-width="1.5" stroke-dasharray="4 3" />
	{/if}
	{#if station.isGoingBack}
		<g>
			<title>Hands back to an earlier station</title>
			<circle cx={goingBackAt.x} cy={goingBackAt.y} r="7" class="fill-carriage-raised stroke-hairline-strong" stroke-width="1" />
			<path d={returnArrowPath(goingBackAt)} class="fill-none stroke-chalk" stroke-width="1.5" stroke-linecap="round" />
		</g>
	{/if}
	<text text-anchor="middle" class="font-sans text-xs {labelClassesOf(station)}">
		{#each label.lines as line, index (index)}
			<tspan x={place.x} y={labelLineY(station, index)}>{line}</tspan>
		{/each}
	</text>
</g>
