<script lang="ts">
	import DocumentProse from './DocumentProse.svelte';
	import type { OptionalClauseReading } from '$lib/data/optionalClauseReading';

	let { clause }: { clause: OptionalClauseReading } = $props();

	const whenChosen = $derived(clause.isChosenByDefault ? 'Chosen unless left out' : 'Left out unless chosen');
</script>

<article class="flex flex-col gap-3">
	<h3 class="font-display text-base text-chalk">{clause.title}</h3>
	<p class="text-xs text-chalk/50">{whenChosen}</p>
	<p class="text-sm text-chalk/60">{clause.summary}</p>
	<DocumentProse documentHtml={clause.clauseHtml} />
</article>
