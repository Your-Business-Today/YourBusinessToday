<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import BillingScheduleLineRows from './BillingScheduleLineRows.svelte';
	import BillingScheduleSettingsFields from './BillingScheduleSettingsFields.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { billingFormFields } from '$lib/data/books/billingScheduleFormField';
	import { fieldsOfDraft, type BillingScheduleDraft } from '$lib/data/books/billingScheduleDraft';
	import { organisationSubmitClasses } from '../organisationFormStyles';
	import type { OrganisationBilling } from '$lib/data/books/organisationBilling';

	let {
		billing,
		initialDraft,
		scheduleId,
		onSaved
	}: { billing: OrganisationBilling; initialDraft: BillingScheduleDraft; scheduleId: string | null; onSaved: () => void } = $props();

	let draft = $state(untrack(() => $state.snapshot(initialDraft)));

	const tracker = new FormTracker();
	const action = $derived(scheduleId === null ? '?/setUpBilling' : '?/changeBilling');
	const postedSchedule = $derived(JSON.stringify(fieldsOfDraft(draft)));
</script>

<form method="POST" {action} use:enhance={tracker.submit(onSaved, { shouldKeepFields: true })} class="flex flex-col gap-6">
	<input type="hidden" name={billingFormFields.schedule} value={postedSchedule} />
	{#if scheduleId !== null}
		<input type="hidden" name={billingFormFields.scheduleId} value={scheduleId} />
	{/if}
	<BillingScheduleSettingsFields bind:draft today={billing.today} />
	<BillingScheduleLineRows bind:draft incomeAccounts={billing.incomeAccounts} costCentres={billing.costCentres} />
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} class={organisationSubmitClasses}>Save billing</SubmitButton>
</form>
