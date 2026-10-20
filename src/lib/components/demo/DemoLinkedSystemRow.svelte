<script lang="ts">
	import type { DemoLinkedSystem } from '$lib/data/demo/demoBusiness';

	let { system }: { system: DemoLinkedSystem } = $props();
</script>

<div class="grid gap-2 border-b border-hairline py-6 md:grid-cols-[16rem_1fr_1fr] md:gap-10">
	<h3 class="font-display text-lg font-medium">{system.name}</h3>
	<p class="text-chalk/70">
		<span class="font-display text-chalk">Holds:</span>
		{system.holds}
	</p>
	<p class="text-chalk/70">
		<span class="font-display text-chalk">Claude:</span>
		{system.claudeReaches}
	</p>
</div>
