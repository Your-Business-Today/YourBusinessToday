<script lang="ts">
	import type { BuildPhase } from '$lib/data/constructionBuild';

	let { phase }: { phase: BuildPhase } = $props();
</script>

<div class="grid gap-2 border-b border-hairline py-7 md:grid-cols-[14rem_1fr] md:gap-10">
	<p class="font-display text-xs tracking-widest text-chalk/50 uppercase">{phase.period}</p>
	<div class="flex flex-col gap-2">
		<h3 class="font-display text-xl font-medium">{phase.name}</h3>
		<p class="max-w-prose text-chalk/70">{phase.description}</p>
	</div>
</div>
