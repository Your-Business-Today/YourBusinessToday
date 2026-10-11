<script lang="ts">
	import type { HarnessDoor } from '$lib/data/harnessDiagram';

	let { door }: { door: HarnessDoor } = $props();
</script>

<div class="flex flex-col gap-2 rounded-2xl border border-hairline bg-night p-5">
	<p class="font-display text-xs tracking-widest text-chalk/50 uppercase">A way in</p>
	<p class="font-display text-lg font-medium">{door.name}</p>
	<p class="text-sm text-chalk/70">{door.description}</p>
</div>
