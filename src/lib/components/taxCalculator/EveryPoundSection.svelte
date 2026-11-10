<script lang="ts">
	import { isPayingHigherRates, isPersonalAllowanceTapered } from '$lib/data/taxCalculator/highIncomeSignals';
	import type { ResultPeriod } from '$lib/data/taxCalculator/resultPeriods';
	import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
	import BreakdownCard from './BreakdownCard.svelte';
	import HighIncomeNotice from './HighIncomeNotice.svelte';
	import SectionHeading from './SectionHeading.svelte';
	import YearComparisonCard from './YearComparisonCard.svelte';

	let { estimate, period }: { estimate: TakeHomeEstimate; period: ResultPeriod } = $props();
</script>

<section class="flex flex-col gap-6" aria-labelledby="every-pound-heading">
	<SectionHeading stepNumber={3} eyebrow="Every pound, explained" heading="Nothing hidden in the small print." id="every-pound-heading">
		{#snippet aside()}
			<a href="#how-it-works" class="text-sm text-go underline-offset-4 hover:underline">Where the figures come from ↗</a>
		{/snippet}
	</SectionHeading>
	<div class="grid items-start gap-5 md:grid-cols-2">
		<BreakdownCard {estimate} {period} />
		<YearComparisonCard inputs={estimate.inputs} />
	</div>
	{#if isPayingHigherRates(estimate)}
		<HighIncomeNotice isAllowanceTapered={isPersonalAllowanceTapered(estimate)} />
	{/if}
</section>
