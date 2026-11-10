<script lang="ts">
	import type { ContentPiecePage } from '$lib/brand/projections/contentPiecePage';

	let { piece }: { piece: ContentPiecePage } = $props();

	const parts = $derived([
		{ label: 'Hook', words: piece.hook },
		{ label: 'Script', words: piece.script },
		{ label: 'Caption', words: piece.caption },
		{ label: 'Asks its audience to', words: piece.invitedAction }
	]);
</script>

<dl class="flex flex-col gap-4">
	{#each parts as part (part.label)}
		<div class="flex flex-col gap-1">
			<dt class="text-sm font-semibold text-chalk">{part.label}</dt>
			<dd class="whitespace-pre-line break-words text-chalk-muted">{part.words || '—'}</dd>
		</div>
	{/each}
</dl>
