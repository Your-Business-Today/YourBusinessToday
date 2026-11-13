<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import BilledLinesTable from './BilledLinesTable.svelte';
	import { billingStandingTones, invoiceFactsOf } from './billedInvoiceView';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import { amountOwedOn, billingStandingLabels, billingStandingOf, isPayable, type BilledInvoice } from '$lib/data/billing/billedInvoice';
	import { billingFields, payAction } from '$lib/portal/billingFields';
	import { portalBilledInvoicePath } from '$lib/portal/portalPaths';

	let { invoice, isPayingOpen }: { invoice: BilledInvoice; isPayingOpen: boolean } = $props();

	const standing = $derived(billingStandingOf(invoice));
	const amountOwed = $derived(amountOwedOn(invoice));
	const canPay = $derived(isPayingOpen && isPayable(invoice));
	const facts = $derived(invoiceFactsOf(invoice, amountOwed));
</script>

<DashboardPanel title={`Invoice ${invoice.printedNumber}`}>
	{#snippet actions()}
		<Badge label={billingStandingLabels[standing]} tone={billingStandingTones[standing]} hasDot />
		<Button href={portalBilledInvoicePath(invoice.id)}>Open the invoice</Button>
		{#if canPay}
			<form method="POST" action={payAction}>
				<input type="hidden" name={billingFields.invoiceId} value={invoice.id} />
				<Button type="submit" look="primary">Pay {formatPoundsAndPence(amountOwed)}</Button>
			</form>
		{/if}
	{/snippet}
	{#snippet toolbar()}
		<dl class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
			{#each facts as fact (fact.label)}
				<div class="flex gap-1.5"><dt class="text-chalk-subtle">{fact.label}</dt><dd class="text-chalk">{fact.value}</dd></div>
			{/each}
		</dl>
	{/snippet}
	<BilledLinesTable {invoice} />
</DashboardPanel>
