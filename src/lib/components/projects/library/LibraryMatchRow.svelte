<script lang="ts">
	import { libraryMatchHref, libraryMatchKindWords } from './libraryMatchAddress';
	import type { LibraryMatch } from '$lib/projectLibrary/libraryMatch';

	let { match }: { match: LibraryMatch } = $props();

	const { kind, excerpt } = $derived(match);
	const kindWords = $derived(libraryMatchKindWords[kind]);
	const hasExcerpt = $derived(excerpt.length > 0);
</script>

<li class="flex flex-col gap-1 px-6 py-4">
	<p class="font-display text-xs font-medium text-chalk-subtle">{kindWords} · {match.section}</p>
	<a href={libraryMatchHref(match)} class="font-display text-base font-medium text-chalk hover:text-go">{match.title}</a>
	{#if hasExcerpt}
		<p class="max-w-3xl text-sm text-chalk-muted">
			{#each excerpt as part, partIndex (partIndex)}
				{#if part.isMatch}<strong class="font-medium text-chalk">{part.words}</strong>{:else}{part.words}{/if}
			{/each}
		</p>
	{:else if match.summary !== ''}
		<p class="max-w-3xl text-sm text-chalk-muted">{match.summary}</p>
	{/if}
</li>
