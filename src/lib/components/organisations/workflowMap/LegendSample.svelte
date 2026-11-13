<script lang="ts">
	import { LegendMarks, type LegendMark } from './workflowMapLegend';
	import { LineTracks } from '$lib/components/lineMap/layout/lineMapModel';
	import { trackDashesOf } from '$lib/components/lineMap/lineTrackDashes';

	let { mark }: { mark: LegendMark } = $props();

	const sampleWidth = 34;
	const sampleHeight = 30;
	const middle = { x: sampleWidth / 2, y: sampleHeight / 2 };
	const trackPath = `M4 ${middle.y}H${sampleWidth - 4}`;
	const trackWidth = 6;
	const trackDashes: Partial<Record<LegendMark, string>> = {
		outsideParty: trackDashesOf(LineTracks.dashed, trackWidth),
		system: trackDashesOf(LineTracks.dotted, trackWidth)
	};
</script>

<svg width={sampleWidth} height={sampleHeight} viewBox="0 0 {sampleWidth} {sampleHeight}" aria-hidden="true" class="shrink-0">
	{#if mark !== LegendMarks.failure}
		<path d={trackPath} class="stroke-sky" stroke-width={trackWidth} stroke-linecap="round" stroke-dasharray={trackDashes[mark]} />
	{/if}
	{#if mark === LegendMarks.tick}
		<rect x={middle.x - 2.5} y={middle.y - 12} width="5" height="12" rx="1.5" class="fill-sky" />
	{/if}
	{#if mark === LegendMarks.ours}
		<circle cx={middle.x} cy={middle.y} r="6.5" class="fill-go stroke-carriage" stroke-width="2.5" />
	{/if}
	{#if mark === LegendMarks.planned}
		<circle cx={middle.x} cy={middle.y} r="6" class="fill-carriage stroke-go" stroke-width="2" stroke-dasharray="3 3" />
	{/if}
	{#if mark === LegendMarks.arrival}
		<circle cx={middle.x} cy={middle.y} r="9" class="fill-carriage stroke-chalk" stroke-width="3" />
	{/if}
	{#if mark === LegendMarks.output}
		<circle cx={middle.x} cy={middle.y} r="12" class="fill-carriage stroke-chalk" stroke-width="3" />
		<circle cx={middle.x} cy={middle.y} r="5.5" class="fill-chalk" />
	{/if}
	{#if mark === LegendMarks.failure}
		<circle cx={middle.x} cy={middle.y} r="8.5" class="fill-signal" />
		<rect x={middle.x - 1} y={middle.y - 4.5} width="2" height="5.5" rx="1" class="fill-night" />
		<circle cx={middle.x} cy={middle.y + 3.2} r="1.2" class="fill-night" />
	{/if}
</svg>
