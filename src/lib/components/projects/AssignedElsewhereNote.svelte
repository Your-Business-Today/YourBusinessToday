<script lang="ts">
	import type { AssignedElsewhereLink } from './assignedElsewhereLinks';

	let { links }: { links: AssignedElsewhereLink[] } = $props();
</script>

{#if links.length > 0}
	<p class="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-xs text-chalk/60">
		<span>Also your move on this project:</span>
		{#each links as link (link.href + link.label)}
			<a class="underline decoration-chalk/30 underline-offset-2 hover:text-chalk" href={link.href}>
				{link.count} on {link.label}
			</a>
		{/each}
	</p>
{/if}
