<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="print-on-paper">{@render children()}</div>

<style>
	@media print {
		.print-on-paper {
			--color-night: var(--color-map-paper);
			--color-carriage: var(--color-map-paper);
			--color-carriage-raised: var(--color-map-paper);
			--color-chalk: var(--color-map-ink);
			--color-chalk-muted: var(--color-slate);
			--color-chalk-subtle: var(--color-slate);
			--color-chalk-faint: var(--color-slate);
			--color-hairline: var(--color-etch);
			--color-hairline-strong: var(--color-etch);
			color: var(--color-map-ink);
		}
	}
</style>
