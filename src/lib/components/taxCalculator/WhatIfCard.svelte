<script lang="ts">
	import { monthsPerYear } from '$lib/data/taxCalculator/resultPeriods';
	import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
	import { outcomeOfEarningMore } from '$lib/data/taxCalculator/takeHomeScenarios';
	import { formatPercentage, formatWholePounds, signed } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import WidgetIcon from './WidgetIcon.svelte';

	let { estimate, extraIncome = $bindable() }: { estimate: TakeHomeEstimate; extraIncome: number } = $props();

	const largestExtraIncome = 30000;
	const extraIncomeStep = 500;
	const outcome = $derived(outcomeOfEarningMore(estimate, extraIncome));
</script>

<article class="flex min-w-0 flex-col gap-5 rounded-3xl border border-go/20 bg-go/5 p-6 sm:p-7">
	<div class="flex items-start justify-between gap-3">
		<div class="flex flex-col gap-2">
			<WidgetIcon name="chart" />
			<h3 class="font-display text-xl font-medium">What if you earned more?</h3>
			<p class="text-sm text-chalk/65">A pay rise or a bigger year looks good. Here’s what it means in real life.</p>
		</div>
		<span class="shrink-0 rounded-md border border-go/30 px-2 py-1 whitespace-nowrap font-mono text-[10px] tracking-widest text-go uppercase">Try it</span>
	</div>
	<label class="flex flex-col gap-3">
		<span class="flex justify-between text-sm text-chalk/75">
			Extra income per year <strong class="font-mono text-chalk">{formatWholePounds(extraIncome)}</strong>
		</span>
		<input type="range" min="0" max={largestExtraIncome} step={extraIncomeStep} bind:value={extraIncome} class="w-full cursor-pointer accent-signal" />
	</label>
	<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
		<p class="font-display text-4xl font-medium text-go">{signed(outcome.extraTakeHome / monthsPerYear)}</p>
		<p class="text-sm text-chalk/60">extra take-home a month</p>
	</div>
	<p class="text-xs text-chalk/55">
		You’d keep {formatPercentage(outcome.shareOfExtraKept)} of every extra pound, with the same pension and loan plan.
	</p>
</article>
