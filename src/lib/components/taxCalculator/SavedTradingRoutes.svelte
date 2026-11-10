<script lang="ts">
	import { monthsPerYear } from '$lib/data/taxCalculator/resultPeriods';
	import { formatMoney } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import { tradingRouteLabels, tradingRouteNames } from '$lib/data/taxCalculator/tradingRouteLabels';
	import type { TradingRouteTakeHomes } from '$lib/data/taxCalculator/tradingRoutes';

	let { takeHomes }: { takeHomes: TradingRouteTakeHomes } = $props();

	const routes = $derived(tradingRouteNames.map((routeName) => ({ routeName, takeHome: takeHomes[routeName] })));
</script>

<dl class="flex flex-col gap-2 rounded-2xl bg-night/50 px-4 py-3 text-sm">
	<dt class="text-xs text-chalk/55">The same income, take-home a month</dt>
	{#each routes as route (route.routeName)}
		<dd class="flex justify-between gap-3">
			<span class="text-chalk/60">{tradingRouteLabels[route.routeName]}</span>
			<span class="font-mono">{route.takeHome === null ? 'No figure' : formatMoney(route.takeHome / monthsPerYear)}</span>
		</dd>
	{/each}
</dl>
