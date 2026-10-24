<script lang="ts">
	import { appMockupName, appMockupNavigation } from '$lib/data/home/appMockup';

	const [currentItem, ...otherItems] = appMockupNavigation;
</script>

<nav class="flex flex-col gap-1 border-r border-hairline bg-carriage/60 p-3" aria-hidden="true">
	<p class="mb-2 font-display text-[0.6rem] font-bold">
		{appMockupName}<span class="text-signal">.</span>
	</p>
	<p class="flex items-center gap-1 rounded bg-signal/15 px-1.5 py-0.5 text-[0.45rem] text-chalk">
		<span class="h-1 w-1 rounded-full bg-signal"></span>{currentItem}
	</p>
	{#each otherItems as item (item)}
		<p class="flex items-center gap-1 px-1.5 py-0.5 text-[0.45rem] text-chalk/50">
			<span class="h-1 w-1 rounded-sm border border-chalk/30"></span>{item}
		</p>
	{/each}
</nav>
