<script lang="ts">
	import BilledLinesTable from '$lib/components/billing/BilledLinesTable.svelte';
	import type { InvoiceDocument } from '$lib/data/books/invoiceDocument';
	import InvoiceDocumentFacts from './InvoiceDocumentFacts.svelte';
	import InvoiceDocumentParty from './InvoiceDocumentParty.svelte';
	import InvoiceDocumentPayment from './InvoiceDocumentPayment.svelte';
	import { documentStampOf, headingFactsOf, isSayingHowToPay, owingFactsOf } from './invoiceDocumentView';

	let { document }: { document: InvoiceDocument } = $props();

	const stamp = $derived(documentStampOf(document));
</script>

<article class="relative flex flex-col gap-8">
	{#if stamp !== null}
		<p class="font-display text-sm font-semibold text-signal">{stamp.sentence}</p>
	{/if}
	<div class="grid gap-6 sm:grid-cols-2 print:grid-cols-2">
		<InvoiceDocumentParty heading="From" party={document.seller} />
		<section class="flex flex-col gap-2 sm:items-end print:items-end">
			<h2 class="font-display text-2xl font-semibold text-chalk">Invoice {document.printedNumber}</h2>
			<InvoiceDocumentFacts facts={headingFactsOf(document)} />
		</section>
	</div>
	<InvoiceDocumentParty heading="Billed to" party={document.customer} />
	<BilledLinesTable invoice={document} />
	<div class="flex justify-end"><InvoiceDocumentFacts facts={owingFactsOf(document)} /></div>
	{#if isSayingHowToPay(document)}
		<InvoiceDocumentPayment howToPay={document.howToPay} />
	{/if}
	{#if document.notes !== ''}
		<p class="text-sm whitespace-pre-line text-chalk-muted">{document.notes}</p>
	{/if}
	{#if stamp !== null}
		<p
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 z-20 flex -rotate-12 items-center justify-center font-display text-8xl font-bold
				tracking-widest text-signal/15 uppercase select-none"
		>
			{stamp.mark}
		</p>
	{/if}
</article>
