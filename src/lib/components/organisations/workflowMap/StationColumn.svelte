<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<section class="flex flex-col gap-3 bg-carriage p-5">
	<h3 class="font-display text-sm font-medium text-chalk-subtle">{title}</h3>
	{@render children()}
</section>
