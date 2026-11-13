<script lang="ts">
	import BilledInvoicesTable from './BilledInvoicesTable.svelte';
	import BillingScheduleForm from './BillingScheduleForm.svelte';
	import BillingScheduleSection from './BillingScheduleSection.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import { blankScheduleDraft, draftOfSchedule, type BillingScheduleDraft } from '$lib/data/books/billingScheduleDraft';
	import { paneToolbarClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BilledSchedule, OrganisationBilling } from '$lib/data/books/organisationBilling';

	let { billing }: { billing: OrganisationBilling } = $props();

	type OpenForm = { title: string; draft: BillingScheduleDraft; scheduleId: string | null };

	let openForm = $state<OpenForm | null>(null);
	let isFormOpen = $state(false);

	function openSetUp() {
		const firstIncomeAccountId = billing.incomeAccounts[0]?.id ?? '';
		openForm = { title: 'Set up billing', draft: blankScheduleDraft(billing.today, firstIncomeAccountId), scheduleId: null };
		isFormOpen = true;
	}

	function openEdit(schedule: BilledSchedule) {
		openForm = { title: `Edit ${schedule.title}`, draft: draftOfSchedule(schedule), scheduleId: schedule.id };
		isFormOpen = true;
	}
</script>

<div class={paneToolbarClasses}>
	<Button onclick={openSetUp}>Set up billing</Button>
</div>

<div class="flex flex-col gap-4">
	{#each billing.schedules as schedule (schedule.id)}
		<BillingScheduleSection {schedule} onEdit={() => openEdit(schedule)} />
	{:else}
		<EmptyState message="Nothing is billed by itself yet. Set up billing to invoice this organisation again and again." />
	{/each}
	<BilledInvoicesTable invoices={billing.invoices} />
</div>

{#if openForm !== null}
	<Modal title={openForm.title} maxWidthClass="max-w-4xl" bind:isOpen={isFormOpen}>
		{#key openForm}
			<BillingScheduleForm {billing} initialDraft={openForm.draft} scheduleId={openForm.scheduleId} onSaved={() => (isFormOpen = false)} />
		{/key}
	</Modal>
{/if}
