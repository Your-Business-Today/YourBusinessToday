<script lang="ts">
	import AppointmentImportForm from '$lib/components/people/AppointmentImportForm.svelte';
	import DraftApproachForm from '$lib/components/people/DraftApproachForm.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import PersonCompanyList from '$lib/components/people/PersonCompanyList.svelte';
	import PersonEventLedger from '$lib/components/people/PersonEventLedger.svelte';
	import PersonFindingsForm from '$lib/components/people/PersonFindingsForm.svelte';
	import PersonFieldsForm from '$lib/components/people/PersonFieldsForm.svelte';
	import PersonHeader from '$lib/components/people/PersonHeader.svelte';
	import PersonLinkList from '$lib/components/people/PersonLinkList.svelte';
	import PersonNoteTimeline from '$lib/components/people/PersonNoteTimeline.svelte';
	import { suggestedGroupNameFor } from '$lib/data/personName';

	let { data, form } = $props();

	const { person } = $derived(data);

	let isEditModalOpen = $state(false);
	let isApproachModalOpen = $state(false);
	let isFindingsModalOpen = $state(false);

	$effect(() => {
		isApproachModalOpen = form?.approachDraft !== undefined;
		isFindingsModalOpen = form?.findings !== undefined;
	});

	const suggestedGroupName = $derived(suggestedGroupNameFor(person.name));
</script>

<svelte:head>
	<title>{person.name} — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
	<PersonHeader {person} onEdit={() => (isEditModalOpen = true)} />
	<FormErrorNote message={form?.message ?? null} />

	<section class="flex flex-col gap-4">
		<h2 class="font-display text-xl">Links</h2>
		<PersonLinkList personId={person.id} links={person.links} />
	</section>

	{#if data.pendingAppointments !== null}
		<AppointmentImportForm appointments={data.pendingAppointments} {suggestedGroupName} />
	{/if}

	<PersonCompanyList
		companies={data.companies}
		parents={data.parents}
		canImport={person.officerId !== null && data.pendingAppointments === null}
	/>

	<section class="flex flex-col gap-4">
		<h2 class="font-display text-xl">Notes</h2>
		<PersonNoteTimeline personId={person.id} notes={person.notes} />
	</section>

	<section class="flex flex-col gap-4">
		<h2 class="font-display text-xl">History</h2>
		<PersonEventLedger events={data.events} />
	</section>
</div>

<Modal title="Edit person" bind:isOpen={isEditModalOpen} maxWidthClass="max-w-2xl">
	<PersonFieldsForm {person} />
</Modal>

<Modal title="Draft approach" bind:isOpen={isApproachModalOpen} maxWidthClass="max-w-2xl">
	{#if form?.approachDraft !== undefined}
		<DraftApproachForm draft={form.approachDraft} />
	{/if}
</Modal>

<Modal title="Found on the web" bind:isOpen={isFindingsModalOpen} maxWidthClass="max-w-2xl">
	{#if form?.findings !== undefined}
		<PersonFindingsForm findings={form.findings} />
	{/if}
</Modal>
