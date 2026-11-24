<script lang="ts">
	import type { Snippet } from 'svelte';

	type PageTitleSize = 'page' | 'compact';

	const sizeClasses: Record<PageTitleSize, string> = {
		page: 'text-3xl',
		compact: 'text-2xl'
	};

	let { size = 'page', children }: { size?: PageTitleSize; children: Snippet } = $props();
</script>

<h1 class="font-display font-medium {sizeClasses[size]}">{@render children()}</h1>
