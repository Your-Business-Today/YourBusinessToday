<script lang="ts">
	import { perPeriod, type ResultPeriod } from '$lib/data/taxCalculator/resultPeriods';
	import type { TakeHomeSegment } from '$lib/data/taxCalculator/takeHomeSegments';
	import { formatMoney } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import { segmentDotClasses } from './segmentColours';

	let { segments, period }: { segments: TakeHomeSegment[]; period: ResultPeriod } = $props();
</script>

<ul class="flex w-full min-w-0 flex-col gap-3 text-sm">
	{#each segments as segment (segment.kind)}
		<li class="flex items-center justify-between gap-3">
			<span class="flex items-center gap-2 text-chalk/75">
				<span class={`size-2 rounded-full ${segmentDotClasses[segment.kind]}`} aria-hidden="true"></span>
				{segment.label}
			</span>
			<span class="font-mono text-chalk">{formatMoney(perPeriod(segment.amount, period))}</span>
		</li>
	{/each}
</ul>
