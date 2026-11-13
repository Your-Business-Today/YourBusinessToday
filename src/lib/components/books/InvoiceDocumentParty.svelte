<script lang="ts">
	import type { DocumentParty } from '$lib/data/books/invoiceDocument';
	import InvoiceDocumentFacts from './InvoiceDocumentFacts.svelte';

	let { heading, party }: { heading: string; party: DocumentParty } = $props();
</script>

<section class="flex flex-col gap-2">
	<h3 class="font-display text-xs tracking-wide text-chalk-faint uppercase">{heading}</h3>
	<p class="font-display text-lg font-semibold text-chalk">{party.name}</p>
	{#if party.address !== ''}
		<p class="text-sm whitespace-pre-line text-chalk-muted">{party.address}</p>
	{/if}
	{#if party.email !== ''}
		<p class="text-sm text-chalk-muted">{party.email}</p>
	{/if}
	<InvoiceDocumentFacts facts={party.facts} />
</section>
