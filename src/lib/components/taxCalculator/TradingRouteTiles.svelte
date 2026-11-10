<script lang="ts">
	import { monthsPerYear } from '$lib/data/taxCalculator/resultPeriods';
	import { formatMoney, signed } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import { tradingRouteLabels, tradingRouteNames } from '$lib/data/taxCalculator/tradingRouteLabels';
	import { takeHomeByRoute, type TradingRouteComparison } from '$lib/data/taxCalculator/tradingRoutes';

	let { comparison }: { comparison: TradingRouteComparison } = $props();

	const takeHomes = $derived(takeHomeByRoute(comparison));
	const bestTakeHome = $derived(takeHomes[comparison.bestRoute] ?? 0);
	const routes = $derived(
		tradingRouteNames.map((routeName) => ({
			routeName,
			takeHome: takeHomes[routeName],
			isBest: routeName === comparison.bestRoute
		}))
	);
</script>

<ul class="grid gap-3 sm:grid-cols-3" aria-label="Take-home by way of trading">
	{#each routes as route (route.routeName)}
		<li class={`flex flex-col gap-1 rounded-2xl border p-4 ${route.isBest ? 'border-go bg-go/10' : 'border-hairline bg-night/40'}`}>
			<span class="text-sm text-chalk/70">{tradingRouteLabels[route.routeName]}</span>
			{#if route.takeHome === null}
				<span class="text-sm text-caution">No figure: check the salary below</span>
			{:else}
				<span class="font-display text-2xl font-medium">{formatMoney(route.takeHome / monthsPerYear)}<span class="ml-1 text-xs text-chalk/50">/ month</span></span>
				<span class="font-mono text-xs text-chalk/55">{formatMoney(route.takeHome)} a year</span>
				{#if route.isBest}
					<span class="text-xs text-go">Leaves you the most</span>
				{:else}
					<span class="text-xs text-chalk/55">{signed((route.takeHome - bestTakeHome) / monthsPerYear)} a month</span>
				{/if}
			{/if}
		</li>
	{/each}
</ul>
