<script lang="ts">
	import { appMockupDecisions } from '$lib/data/home/appMockup';
</script>

<div class="flex flex-col gap-1 rounded-md border border-hairline bg-carriage p-2">
	<p class="text-[0.42rem] font-medium text-chalk/80">{appMockupDecisions.title}</p>
	{#each appMockupDecisions.items as item (item)}
		<p class="flex items-center gap-1 text-[0.38rem] text-chalk/60">
			<span class="h-1 w-1 shrink-0 rounded-full bg-signal"></span>{item}
		</p>
	{/each}
</div>
