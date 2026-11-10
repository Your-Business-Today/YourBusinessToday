<script lang="ts">
	import type { TakeHomeSegment } from '$lib/data/taxCalculator/takeHomeSegments';
	import { formatPercentage } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import { segmentStrokeClasses } from './segmentColours';

	let { segments, shareKept }: { segments: TakeHomeSegment[]; shareKept: number } = $props();

	const radius = 42;
	const circumference = 2 * Math.PI * radius;
	const gapBetweenSegments = 1.5;

	const total = $derived(segments.reduce((sum, segment) => sum + segment.amount, 0));
	const arcs = $derived.by(() => {
		let offset = 0;
		return segments.filter((segment) => segment.amount > 0).map((segment) => {
			const length = total > 0 ? (segment.amount / total) * circumference : 0;
			const arc = { kind: segment.kind, dash: Math.max(0, length - gapBetweenSegments), offset };
			offset += length;
			return arc;
		});
	});
</script>

<div class="relative size-36 shrink-0 sm:size-40">
	<svg viewBox="0 0 100 100" class="size-full -rotate-90" aria-hidden="true">
		<circle cx="50" cy="50" r={radius} class="fill-none stroke-chalk/10" stroke-width="9" />
		{#each arcs as arc (arc.kind)}
			<circle
				cx="50"
				cy="50"
				r={radius}
				class={`fill-none transition-all duration-500 ${segmentStrokeClasses[arc.kind]}`}
				stroke-width="9"
				stroke-linecap="butt"
				stroke-dasharray={`${arc.dash} ${circumference}`}
				stroke-dashoffset={-arc.offset}
			/>
		{/each}
	</svg>
	<div class="absolute inset-0 grid place-content-center text-center">
		<p class="font-display text-3xl font-medium text-chalk">{formatPercentage(shareKept)}</p>
		<p class="text-xs text-chalk/60">you keep</p>
	</div>
</div>
