<script lang="ts">
	import { monthsPerYear } from '$lib/data/taxCalculator/resultPeriods';
	import { formatMoney } from '$lib/data/taxCalculator/taxCalculatorFormatting';

	let { takeHome, isVisible }: { takeHome: number; isVisible: boolean } = $props();
</script>

<a
	href="#take-home"
	aria-hidden={!isVisible}
	tabindex={isVisible ? 0 : -1}
	class={[
		'fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-2xl border border-signal/30',
		'bg-carriage/95 px-5 py-3 shadow-2xl shadow-night backdrop-blur transition duration-300 md:hidden',
		isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0'
	]}
>
	<span class="flex flex-col">
		<span class="text-xs text-chalk/60">You keep</span>
		<span class="font-display text-xl font-medium">{formatMoney(takeHome / monthsPerYear)} <span class="text-sm text-chalk/60">a month</span></span>
	</span>
	<span class="rounded-full bg-go px-4 py-2 text-sm font-medium text-night">See breakdown</span>
</a>
