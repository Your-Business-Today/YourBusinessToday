<script lang="ts">
	import { JourneyLegendMarks, type JourneyLegendMark } from './journeyLegend';

	let { mark }: { mark: JourneyLegendMark } = $props();

	const sampleWidth = 34;
	const sampleHeight = 30;
	const middle = { x: sampleWidth / 2, y: sampleHeight / 2 };
	const trackPath = `M4 ${middle.y}H${sampleWidth - 4}`;
</script>

<svg width={sampleWidth} height={sampleHeight} viewBox="0 0 {sampleWidth} {sampleHeight}" aria-hidden="true" class="shrink-0">
	<path d={trackPath} class="stroke-sky" stroke-width="6" stroke-linecap="round" />
	{#if mark === JourneyLegendMarks.view}
		<rect x={middle.x - 2.5} y={middle.y - 12} width="5" height="12" rx="1.5" class="fill-sky" />
	{/if}
	{#if mark === JourneyLegendMarks.shared}
		<rect x={middle.x - 7} y="2" width="14" height={sampleHeight - 4} rx="7" class="fill-carriage stroke-chalk" stroke-width="2.5" />
	{/if}
</svg>
