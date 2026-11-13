<script lang="ts">
	import InvoiceDocumentPage from '$lib/components/books/InvoiceDocumentPage.svelte';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';

	let { data } = $props();

	const { document, booksOrganisation, invoicesHref, pdfHref } = $derived(data);
	const crumbs = $derived([{ label: framePageLabels.invoices, href: invoicesHref }]);
</script>

<InvoiceDocumentPage {crumbs} {document} {pdfHref} placeName={booksOrganisation.name} />
