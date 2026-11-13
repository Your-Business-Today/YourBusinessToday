<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import PrintOnPaper from '$lib/components/workspace/PrintOnPaper.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { Crumb } from '$lib/components/workspace/projectCrumbs';
	import type { InvoiceDocument as Document } from '$lib/data/books/invoiceDocument';
	import InvoiceDocument from './InvoiceDocument.svelte';
	import { invoiceStatusLabels, invoiceStatusTones } from './invoiceDocumentView';

	let { crumbs, document, placeName }: { crumbs: Crumb[]; document: Document; placeName: string } = $props();

	const title = $derived(`Invoice ${document.printedNumber}`);
	const seller = $derived(document.seller);
	const customer = $derived(document.customer);
	const printOrSave = () => window.print();
</script>

<svelte:head>
	<title>{title} — {placeName}</title>
</svelte:head>

<PrintOnPaper>
	<div class="print:hidden">
		<WorkspaceHeader {crumbs} {title}>
			{#snippet badge()}
				<Badge label={invoiceStatusLabels[document.status]} tone={invoiceStatusTones[document.status]} hasDot />
			{/snippet}
			{#snippet actions()}
				<Button look="primary" onclick={printOrSave}>Print or save as PDF</Button>
			{/snippet}
			<p class="text-sm text-chalk-subtle">From {seller.name} to {customer.name}, as it prints on A4.</p>
		</WorkspaceHeader>
	</div>
	<div class={`${workspaceBodyClasses} print:p-0`}>
		<DashboardPanel isPadded class="mx-auto w-full max-w-4xl print:max-w-none print:border-0">
			<InvoiceDocument {document} />
		</DashboardPanel>
	</div>
</PrintOnPaper>

<style>
	@media print {
		@page {
			size: A4;
			margin: 16mm;
		}
	}
</style>
