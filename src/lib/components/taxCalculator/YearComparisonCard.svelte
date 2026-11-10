<script lang="ts">
	import { monthsPerYear } from '$lib/data/taxCalculator/resultPeriods';
	import type { TakeHomeInputs } from '$lib/data/taxCalculator/takeHomeInputs';
	import { takeHomeByTaxYear } from '$lib/data/taxCalculator/takeHomeScenarios';
	import { formatMoney, signed } from '$lib/data/taxCalculator/taxCalculatorFormatting';

	let { inputs }: { inputs: TakeHomeInputs } = $props();

	const years = $derived(takeHomeByTaxYear(inputs));
	const monthlyChange = $derived(((years.at(-1)?.takeHome ?? 0) - (years[0]?.takeHome ?? 0)) / monthsPerYear);
	const isUnchanged = $derived(Math.abs(monthlyChange) < 0.005);
</script>

<article class="flex min-w-0 flex-col gap-4 rounded-3xl border border-hairline bg-linear-to-br from-carriage to-night p-6 sm:p-7">
	<p class="font-mono text-[11px] tracking-[0.2em] text-chalk/55 uppercase">Look back, plan ahead</p>
	<h3 class="font-display text-2xl leading-tight font-medium sm:text-3xl">A new tax year.<br />A different picture?</h3>
	<p class="text-sm text-chalk/60">The same numbers, worked out for each tax year.</p>
	<ul class="flex flex-col">
		{#each years as year (year.taxYear)}
			<li class="flex items-baseline justify-between gap-3 border-b border-hairline py-4">
				<span class="font-mono text-sm text-chalk/75">{year.taxYear}</span>
				<span class="font-display text-xl text-chalk">{formatMoney(year.takeHome / monthsPerYear)}<span class="ml-1 text-xs text-chalk/50">/ month</span></span>
			</li>
		{/each}
	</ul>
	<p class="rounded-2xl bg-night/50 px-4 py-3 text-sm text-chalk/75">
		{#if isUnchanged}
			Same take-home in both years with these numbers.
		{:else}
			{signed(monthlyChange)} a month in {years.at(-1)?.taxYear} compared with {years[0]?.taxYear}.
		{/if}
	</p>
	<p class="text-xs text-chalk/45">Keeps everything else the same, including your loan plan and pension.</p>
</article>
