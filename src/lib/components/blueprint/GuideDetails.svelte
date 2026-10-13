<script lang="ts">
	import type { AgentGuide } from '$lib/data/blueprint/mcpMap';

	let { guide }: { guide: AgentGuide } = $props();

	const { description, path } = $derived(guide);
</script>

<div class="flex min-w-0 flex-col gap-3">
	<p class="text-chalk/80">{description || 'No description written yet.'}</p>
	<p class="text-chalk/70">Defined in <code class="font-mono text-xs text-chalk/90">{path}</code></p>
</div>
