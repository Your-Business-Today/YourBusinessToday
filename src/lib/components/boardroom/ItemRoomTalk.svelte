<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import BoardContributionEntry from './BoardContributionEntry.svelte';
	import { outcomeBadgeOf } from './itemOutcomeBadges';
	import type { ItemRoomView } from '$lib/data/boardRoomViews';

	let { room }: { room: ItemRoomView } = $props();

	const badge = $derived(outcomeBadgeOf(room.outcome));
	const said = $derived(room.said);
</script>

<section class="flex flex-col gap-2" aria-label="In the room">
	<div class="flex flex-wrap items-center gap-2">
		<p class="text-sm font-medium text-chalk">In the room</p>
		{#if badge !== null}
			<Badge label={badge.label} tone={badge.tone} />
		{/if}
	</div>
	{#if said.length > 0}
		<ol class="flex flex-col gap-3">
			{#each said as contribution (contribution.id)}
				<BoardContributionEntry {contribution} />
			{/each}
		</ol>
	{:else if room.isOpen}
		<p class="text-sm text-chalk-subtle">Nothing has been said on this item yet.</p>
	{/if}
	<p class="text-xs break-words text-chalk-subtle">{room.standing}</p>
</section>
