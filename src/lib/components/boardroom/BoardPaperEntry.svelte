<script lang="ts">
	import type { BoardPaperView } from '$lib/data/boardPaperViews';

	let { paper }: { paper: BoardPaperView } = $props();

	const addedLine = $derived(`${paper.whatItIs}, added by ${paper.addedByName}`);
</script>

<li class="flex flex-col gap-1 border-l-2 border-hairline-strong pl-3">
	{#if paper.href === null}
		<details>
			<summary class="cursor-pointer text-sm font-medium text-chalk">{paper.title}</summary>
			<p class="mt-2 text-sm whitespace-pre-wrap text-chalk-muted">{paper.text}</p>
		</details>
	{:else}
		<a href={paper.href} class="text-sm font-medium text-chalk hover:text-go">{paper.title}</a>
	{/if}
	<p class="text-xs text-chalk-subtle">{addedLine}</p>
</li>
