<script lang="ts">
	import { appMockupOrders } from '$lib/data/home/appMockup';
</script>

<div class="flex flex-col gap-1 rounded-md border border-hairline bg-carriage p-2">
	<p class="text-[0.42rem] font-medium text-chalk/80">{appMockupOrders.title}</p>
	<div class="grid grid-cols-4 gap-x-2 text-[0.36rem] text-chalk/40">
		{#each appMockupOrders.columns as column (column)}
			<span>{column}</span>
		{/each}
	</div>
	{#each appMockupOrders.rows as row (row.order)}
		<div class="grid grid-cols-4 gap-x-2 border-t border-hairline pt-1 text-[0.38rem] text-chalk/70">
			<span class="text-chalk">{row.customer}</span>
			<span>{row.order}</span>
			<span>{row.value}</span>
			<span>{row.status}</span>
		</div>
	{/each}
</div>
