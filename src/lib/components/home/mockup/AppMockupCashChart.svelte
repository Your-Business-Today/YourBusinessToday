<script lang="ts">
	import { sparklineArea, sparklinePoints, sparklineViewBox } from './sparkline';
	import { appMockupCashChart } from '$lib/data/home/appMockup';

	const points = sparklinePoints(appMockupCashChart.values);
	const area = sparklineArea(points);
</script>

<div class="flex flex-col gap-1 rounded-md border border-hairline bg-carriage p-2">
	<p class="text-[0.42rem] font-medium text-chalk/80">{appMockupCashChart.title}</p>
	<svg viewBox={sparklineViewBox} preserveAspectRatio="none" class="h-14 w-full">
		<path d={area} class="fill-signal/20" />
		<polyline {points} class="fill-none stroke-signal" stroke-width="1.2" stroke-linejoin="round" />
	</svg>
</div>
