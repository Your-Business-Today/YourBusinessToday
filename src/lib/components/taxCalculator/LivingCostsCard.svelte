<script lang="ts">
	import { monthsPerYear } from '$lib/data/taxCalculator/resultPeriods';
	import { formatMoney } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import { widgetCardClasses } from './calculatorStyles';
	import WidgetIcon from './WidgetIcon.svelte';

	let { takeHome, livingCosts = $bindable() }: { takeHome: number; livingCosts: number | null } = $props();

	const monthlyTakeHome = $derived(takeHome / monthsPerYear);
	const breathingRoom = $derived(monthlyTakeHome - (livingCosts ?? 0));
	const shareSpent = $derived(monthlyTakeHome > 0 ? Math.min(1, (livingCosts ?? 0) / monthlyTakeHome) : 1);
	const percent = 100;
</script>

<article class={widgetCardClasses}>
	<WidgetIcon name="wallet" toneClasses="bg-lilac/15 text-lilac" />
	<h3 class="font-display text-xl font-medium">Room for the things you love.</h3>
	<p class="text-sm text-chalk/65">Put in your monthly living costs. See what’s left for saving, spending or something special.</p>
	<label class="flex flex-col gap-2">
		<span class="text-sm font-medium text-chalk">Monthly living costs</span>
		<span class="flex items-center gap-2 rounded-2xl border border-hairline bg-night/70 px-4 focus-within:border-go">
			<span class="text-chalk/50" aria-hidden="true">£</span>
			<input type="number" min="0" step="10" inputmode="decimal" bind:value={livingCosts} class="min-h-12 w-full min-w-0 bg-transparent text-chalk outline-none" />
			<span class="shrink-0 text-xs text-chalk/50">per month</span>
		</span>
	</label>
	<div class="h-2 overflow-hidden rounded-full bg-chalk/10" aria-hidden="true">
		<div class="h-full rounded-full bg-lilac transition-all duration-500" style:width={`${shareSpent * percent}%`}></div>
	</div>
	<div class="flex items-baseline justify-between gap-3">
		<span class="text-sm text-chalk/65">{breathingRoom < 0 ? 'Short each month' : 'Your breathing room / month'}</span>
		<span class={`font-display text-2xl font-medium ${breathingRoom < 0 ? 'text-caution' : 'text-chalk'}`}>
			{formatMoney(Math.abs(breathingRoom))}
		</span>
	</div>
</article>
