<script lang="ts">
	import InvoiceDocumentPage from '$lib/components/books/InvoiceDocumentPage.svelte';
	import { portalBillingPath, portalHomePath } from '$lib/portal/portalPaths';

	let { data } = $props();

	const { document, visitor, pdfHref } = $derived(data);
	const crumbs = $derived([
		{ label: visitor.organisationName, href: portalHomePath },
		{ label: 'Billing', href: portalBillingPath }
	]);
</script>

<InvoiceDocumentPage {crumbs} {document} {pdfHref} placeName={`${visitor.organisationName} — Client portal`} />
