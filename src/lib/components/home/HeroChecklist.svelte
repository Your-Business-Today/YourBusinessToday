<script lang="ts">
	import LineIcon from '../site/LineIcon.svelte';
	import { heroChecklist } from '$lib/data/home/heroCopy';
</script>

<ul class="flex flex-wrap gap-x-6 gap-y-2 font-display text-lg text-chalk/90">
	{#each heroChecklist as item (item)}
		<li class="flex items-center gap-2">
			<LineIcon kind="check" class="h-5 w-5 text-signal" />
			{item}
		</li>
	{/each}
</ul>
