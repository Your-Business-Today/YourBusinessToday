<script lang="ts">
	import InvoiceDocumentPage from '$lib/components/books/InvoiceDocumentPage.svelte';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';

	let { data } = $props();

	const { document, booksOrganisation, booksHref } = $derived(data);
	const crumbs = $derived([{ label: framePageLabels.reports, href: booksHref }]);
</script>

<InvoiceDocumentPage {crumbs} {document} placeName={booksOrganisation.name} />
