<script lang="ts">
	import AppMockupCashChart from './AppMockupCashChart.svelte';
	import AppMockupDecisions from './AppMockupDecisions.svelte';
	import AppMockupOrders from './AppMockupOrders.svelte';
	import AppMockupSidebar from './AppMockupSidebar.svelte';
	import AppMockupTiles from './AppMockupTiles.svelte';
	import { appMockupGreeting } from '$lib/data/home/appMockup';
</script>

<div class="grid grid-cols-[22%_1fr] bg-night text-chalk">
	<AppMockupSidebar />
	<div class="flex flex-col gap-2 p-3">
		<div class="flex items-start justify-between">
			<div>
				<p class="font-display text-[0.6rem] font-semibold">{appMockupGreeting.heading}</p>
				<p class="text-[0.4rem] text-chalk/50">{appMockupGreeting.line}</p>
			</div>
			<span class="rounded border border-hairline px-1.5 py-0.5 text-[0.4rem] text-chalk/60">
				{appMockupGreeting.period} ▾
			</span>
		</div>
		<AppMockupTiles />
		<div class="grid grid-cols-[1.6fr_1fr] gap-2">
			<AppMockupCashChart />
			<AppMockupDecisions />
		</div>
		<AppMockupOrders />
	</div>
</div>
