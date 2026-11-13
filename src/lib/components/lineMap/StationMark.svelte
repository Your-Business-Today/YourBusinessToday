<script lang="ts">
	import { LabelSides, StationStates } from './layout/lineMapModel';
	import type { DrawnStation } from './drawnStations';
	import { lineFillClasses } from './lineColourClasses';
	import { MarkKinds, markKindOf } from './stationMarks';

	let { station }: { station: DrawnStation } = $props();

	const tickHeight = 12;
	const { place, state, label } = $derived(station);
	const markKind = $derived(markKindOf(station));
	const isLabelBelow = $derived(label.side === LabelSides.below);
	const tickTop = $derived(isLabelBelow ? place.y : place.y - tickHeight);
</script>

{#if markKind === MarkKinds.shared}
	<rect x={place.x - 9} y={place.top - 9} width="18" height={place.foot - place.top + 18} rx="9" class="fill-carriage stroke-chalk" stroke-width="3" />
{/if}
{#if markKind === MarkKinds.output}
	<circle cx={place.x} cy={place.y} r="13" class="fill-carriage stroke-chalk" stroke-width="3" />
	{#if state === StationStates.ours}
		<circle cx={place.x} cy={place.y} r="6" class="fill-go" />
	{/if}
	{#if state === StationStates.planned}
		<circle cx={place.x} cy={place.y} r="6" class="fill-carriage stroke-go" stroke-width="2" stroke-dasharray="3 3" />
	{/if}
	{#if state === StationStates.elsewhere}
		<circle cx={place.x} cy={place.y} r="6" class="fill-chalk" />
	{/if}
{/if}
{#if markKind === MarkKinds.arrival}
	<circle cx={place.x} cy={place.y} r="9" class="fill-carriage stroke-chalk" stroke-width="3" />
	{#if state === StationStates.ours}
		<circle cx={place.x} cy={place.y} r="4" class="fill-go" />
	{/if}
	{#if state === StationStates.planned}
		<circle cx={place.x} cy={place.y} r="4" class="fill-carriage stroke-go" stroke-width="1.5" stroke-dasharray="2 2" />
	{/if}
{/if}
{#if markKind === MarkKinds.ours}
	<circle cx={place.x} cy={place.y} r="6.5" class="fill-go stroke-carriage" stroke-width="2.5" />
{/if}
{#if markKind === MarkKinds.planned}
	<circle cx={place.x} cy={place.y} r="6" class="fill-carriage stroke-go" stroke-width="2" stroke-dasharray="3 3" />
{/if}
{#if markKind === MarkKinds.elsewhere}
	<rect x={place.x - 2.5} y={tickTop} width="5" height={tickHeight} rx="1.5" class={lineFillClasses[station.colour]} />
{/if}
