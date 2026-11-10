<script lang="ts">
	import BrandDecisionNote from './BrandDecisionNote.svelte';
	import type { KitEntry } from '$lib/brand/projections/brandKitPage';

	let { entries, emptyMessage }: { entries: KitEntry[]; emptyMessage: string } = $props();
</script>

{#if entries.length === 0}
	<p class="text-sm text-chalk-subtle">{emptyMessage}</p>
{:else}
	<ul class="grid gap-6 sm:grid-cols-2">
		{#each entries as entry (entry.key)}
			<li class="flex gap-4">
				<span aria-hidden="true" class="h-14 w-14 shrink-0 border border-hairline-strong" style:background-color={entry.value}></span>
				<div class="flex min-w-0 flex-col gap-1">
					<p class="text-sm font-semibold text-chalk">{entry.label}</p>
					<p class="font-mono text-sm text-chalk">{entry.value}</p>
					<p class="text-sm text-chalk-muted">{entry.purpose}</p>
					<BrandDecisionNote {entry} />
				</div>
			</li>
		{/each}
	</ul>
{/if}
