<script lang="ts">
	import BilledInvoicePanel from '$lib/components/billing/BilledInvoicePanel.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { portalHomePath } from '$lib/portal/portalPaths';

	let { data, form } = $props();

	const visitor = $derived(data.visitor);
	const invoices = $derived(data.invoices);
	const crumbs = $derived([{ label: visitor.organisationName, href: portalHomePath }]);
	const noInvoices = 'Your Business Today has not raised an invoice to your organisation yet. When it does, it shows here.';
	const payingNotOpen = 'Paying by card opens here soon. Until then, pay as the invoice says.';
	const thanks = $derived(
		data.paidPrintedNumber === null
			? ''
			: `Thank you for paying invoice ${data.paidPrintedNumber}. It shows as paid here once Stripe has told us.`
	);
</script>

<svelte:head>
	<title>Billing — {visitor.organisationName} — Client portal</title>
</svelte:head>

<WorkspaceHeader {crumbs} title="Billing" />

<div class={workspaceBodyClasses}>
	<FlashMessage message={thanks} />
	{#if form?.message}
		<p role="alert" class="border border-signal/40 bg-signal/10 px-4 py-3 text-sm text-signal">{form.message}</p>
	{/if}
	{#if invoices.length === 0}
		<EmptyState message={noInvoices} />
	{:else}
		{#if !data.isPayingOpen}
			<p class="text-sm text-chalk-subtle">{payingNotOpen}</p>
		{/if}
		{#each invoices as invoice (invoice.id)}
			<BilledInvoicePanel {invoice} isPayingOpen={data.isPayingOpen} />
		{/each}
	{/if}
</div>
