<script lang="ts">
	import type { Snippet } from 'svelte';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';

	let {
		title,
		description,
		count,
		children
	}: { title: string; description: string; count: number; children: Snippet } = $props();
</script>

{#if count > 0}
	<section class="flex flex-col gap-3">
		<div class="flex items-baseline justify-between gap-3">
			<div class="flex flex-col gap-0.5">
				<h2 class="font-display text-xs tracking-widest text-signal uppercase">{title}</h2>
				<p class="text-sm text-chalk/60">{description}</p>
			</div>
			<span class="shrink-0 font-display text-sm text-signal">{count}</span>
		</div>
		<ul class="{panelListClasses} rounded-xl border border-signal/40 bg-carriage">
			{@render children()}
		</ul>
	</section>
{/if}
