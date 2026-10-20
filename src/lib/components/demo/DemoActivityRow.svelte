<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { DemoLogEntry } from '$lib/data/demo/demoBusiness';

	let { entry }: { entry: DemoLogEntry } = $props();
</script>

<li class="flex flex-col gap-1 border-b border-hairline py-3 md:flex-row md:gap-6">
	<span class="shrink-0 font-display text-xs tracking-widest text-chalk/50 uppercase md:w-32">
		{formatBritishDate(entry.on)}
	</span>
	<p class="text-chalk/80">{entry.sentence}</p>
</li>
