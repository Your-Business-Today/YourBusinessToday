<script lang="ts">
	import type { Snippet } from 'svelte';

	let { projectName, children }: { projectName: string; children: Snippet } = $props();
</script>

<div class="flex flex-col gap-1">
	<h3 class="font-display text-base leading-snug font-medium transition group-hover/tile:text-go">
		{projectName}
	</h3>
	{@render children()}
</div>
