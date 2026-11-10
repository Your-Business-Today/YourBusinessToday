<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { dealtWithAction, stripeEventFields } from './stripeEventFields';
	import { stripeEventAmountOf, stripeEventKindOf, stripeOutcomeLabels, type StripeEventToCheck } from '$lib/data/billing/stripeEventToCheck';
	import { formatUkDateTime } from '$lib/data/britishDate';

	let { events }: { events: StripeEventToCheck[] } = $props();

	const columns: RecordsColumn<StripeEventToCheck>[] = [
		{ key: 'receivedAt', label: 'Received', sortValue: (event) => event.receivedAt },
		{ key: 'kind', label: 'Kind' },
		{ key: 'amount', label: 'Amount', isFigure: true, sortValue: (event) => event.amountPence },
		{ key: 'outcome', label: 'Standing' },
		{ key: 'reason', label: 'Why', isWideOnly: true },
		{ key: 'dealtWith', label: 'Dealt with' }
	];
</script>

<RecordsTable
	label="Stripe payments to check"
	{columns}
	rows={events}
	keyOf={(event) => event.id}
	emptyMessage="Every Stripe payment and refund is posted to the books."
>
	{#snippet cells(event)}
		<RecordsCell>{formatUkDateTime(event.receivedAt)}</RecordsCell>
		<RecordsCell>{stripeEventKindOf(event)}<br /><span class="text-xs text-chalk-subtle">{event.stripeEventId}</span></RecordsCell>
		<RecordsCell kind="figure">{stripeEventAmountOf(event)}</RecordsCell>
		<RecordsCell><Badge label={stripeOutcomeLabels[event.outcome]} tone="warning" hasDot /></RecordsCell>
		<RecordsCell isWideOnly>{event.reason}<br /><span class="text-xs text-chalk-subtle">{event.payerEmail}</span></RecordsCell>
		<RecordsCell>
			<form method="POST" action={dealtWithAction}>
				<input type="hidden" name={stripeEventFields.eventRowId} value={event.id} />
				<Button type="submit">Dealt with</Button>
			</form>
		</RecordsCell>
	{/snippet}
</RecordsTable>
