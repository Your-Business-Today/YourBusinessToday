<script lang="ts">
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import { verdictLabelOf } from '$lib/brand/content/contentWords';
	import type { ReviewEntry } from '$lib/brand/projections/contentPiecePage';

	let { reviews }: { reviews: ReviewEntry[] } = $props();
</script>

{#if reviews.length === 0}
	<p class="text-sm text-chalk-subtle">No one has reviewed this piece yet.</p>
{:else}
	<ol class="flex flex-col gap-4">
		{#each reviews as review (review.key)}
			<li class="flex flex-col gap-1">
				<p class="text-sm font-semibold text-chalk">{verdictLabelOf(review.verdict)}</p>
				{#if review.body !== ''}
					<p class="whitespace-pre-line break-words text-chalk-muted">{review.body}</p>
				{/if}
				<p class="text-xs text-chalk-faint">{formatBritishDateTime(review.createdAt)}</p>
			</li>
		{/each}
	</ol>
{/if}
