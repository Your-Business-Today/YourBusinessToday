<script lang="ts">
	import BrandDecisionNote from './BrandDecisionNote.svelte';
	import type { KitEntry } from '$lib/brand/projections/brandKitPage';

	let { entries, emptyMessage }: { entries: KitEntry[]; emptyMessage: string } = $props();
</script>

{#if entries.length === 0}
	<p class="text-sm text-chalk-subtle">{emptyMessage}</p>
{:else}
	<dl class="flex flex-col gap-4">
		{#each entries as entry (entry.key)}
			<div class="flex flex-col gap-1">
				<dt class="text-sm font-semibold text-chalk">{entry.label}</dt>
				<dd class="flex flex-col gap-1">
					<p class="text-chalk">{entry.value}</p>
					<BrandDecisionNote {entry} />
				</dd>
			</div>
		{/each}
	</dl>
{/if}
