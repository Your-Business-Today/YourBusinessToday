<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import { billingScheduleLimits } from '$lib/data/books/billingSchedule';
	import { billingCoverChoices, billingFrequencyChoices } from './billingFormChoices';
	import type { BillingScheduleDraft } from '$lib/data/books/billingScheduleDraft';

	let { draft = $bindable(), today }: { draft: BillingScheduleDraft; today: string } = $props();

	const { longestTitle, latestDayOfMonth, paymentTermsDays } = billingScheduleLimits;
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	<FormField label="Title" hint="What the schedule bills, such as Monthly fees.">
		<input type="text" bind:value={draft.title} maxlength={longestTitle} required />
	</FormField>
	<FormField label="How often">
		<select bind:value={draft.frequency} required>
			{#each billingFrequencyChoices as choice (choice.value)}
				<option value={choice.value}>{choice.label}</option>
			{/each}
		</select>
	</FormField>
	<FormField label="Next invoice" hint={`Today or later, on day 1 to ${latestDayOfMonth} of the month.`}>
		<input type="date" bind:value={draft.nextInvoiceDate} min={today} required />
	</FormField>
	<FormField label="Each invoice covers">
		<select bind:value={draft.covers} required>
			{#each billingCoverChoices as choice (choice.value)}
				<option value={choice.value}>{choice.label}</option>
			{/each}
		</select>
	</FormField>
	<FormField label="Days to pay" hint="Leave empty for the books' own.">
		<input type="number" bind:value={draft.paymentTermsDays} min={paymentTermsDays.smallest} max={paymentTermsDays.largest} step="1" />
	</FormField>
	<FormField label="Last date" hint="Leave empty to bill until it is ended.">
		<input type="date" bind:value={draft.endsOn} min={draft.nextInvoiceDate} />
	</FormField>
	<FormField label="Notes printed on each invoice" class="md:col-span-2">
		<textarea bind:value={draft.notes} rows="2"></textarea>
	</FormField>
	<label class="flex items-center gap-2 text-sm text-chalk md:col-span-2">
		<input type="checkbox" bind:checked={draft.sendsByItself} />
		Sends by itself: each invoice is issued and emailed on its day. Left unticked, each waits as a draft.
	</label>
</div>
