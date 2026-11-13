<script lang="ts">
	import type { DocumentFact } from '$lib/data/books/invoiceDocument';

	let { facts }: { facts: DocumentFact[] } = $props();
</script>

{#if facts.length > 0}
	<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
		{#each facts as fact (fact.label)}
			<dt class="text-chalk-subtle">{fact.label}</dt>
			<dd class="whitespace-pre-line text-chalk">{fact.value}</dd>
		{/each}
	</dl>
{/if}
