<script lang="ts">
	import type { HowToPay } from '$lib/data/books/invoiceDocument';
	import InvoiceDocumentFacts from './InvoiceDocumentFacts.svelte';

	let { howToPay }: { howToPay: HowToPay } = $props();
</script>

<section class="flex flex-col gap-2">
	<h3 class="font-display text-xs tracking-wide text-chalk-faint uppercase">How to pay</h3>
	{#if howToPay.instructions !== ''}
		<p class="text-sm whitespace-pre-line text-chalk-muted">{howToPay.instructions}</p>
	{/if}
	<InvoiceDocumentFacts facts={howToPay.bankFacts} />
	<p class="text-sm text-chalk">When you pay, quote {howToPay.quote}.</p>
</section>
