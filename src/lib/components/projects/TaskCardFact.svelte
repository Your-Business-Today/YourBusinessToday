<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children }: { label: string; children: Snippet } = $props();
</script>

<dt class="font-display text-[0.7rem] tracking-wide whitespace-nowrap text-chalk/40 uppercase">
	{label}
</dt>
<dd class="min-w-0">{@render children()}</dd>
