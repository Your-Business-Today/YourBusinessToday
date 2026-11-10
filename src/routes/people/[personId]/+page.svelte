<script lang="ts">
	import AppointmentImportForm from '$lib/components/people/AppointmentImportForm.svelte';
	import AskClaudeToResearchPerson from '$lib/components/people/AskClaudeToResearchPerson.svelte';
	import AskClaudeToDraftApproach from '$lib/components/people/AskClaudeToDraftApproach.svelte';
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import PersonCompanyList from '$lib/components/people/PersonCompanyList.svelte';
	import PersonEventLedger from '$lib/components/people/PersonEventLedger.svelte';
	import PersonFieldsForm from '$lib/components/people/PersonFieldsForm.svelte';
	import PersonHeader from '$lib/components/people/PersonHeader.svelte';
	import PersonLinkList from '$lib/components/people/PersonLinkList.svelte';
	import PersonNoteTimeline from '$lib/components/people/PersonNoteTimeline.svelte';
	import { suggestedGroupNameFor } from '$lib/data/personName';

	let { data, form } = $props();

	const { person } = $derived(data);

	let isEditModalOpen = $state(false);
	let isApproachModalOpen = $state(false);
	let isResearchModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);

	const suggestedGroupName = $derived(suggestedGroupNameFor(person.name));
</script>

<svelte:head>
	<title>{person.name} — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
	<PersonHeader
		{person}
		onEdit={() => (isEditModalOpen = true)}
		onResearch={() => (isResearchModalOpen = true)}
		onDraftApproach={() => (isApproachModalOpen = true)}
		onDelete={() => (isDeleteModalOpen = true)}
	/>
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

<Modal title="Draft the approach with your Claude" bind:isOpen={isApproachModalOpen} maxWidthClass="max-w-2xl">
	<AskClaudeToDraftApproach person={{ id: person.id, name: person.name }} />
</Modal>

<Modal title="Find them on the web with your Claude" bind:isOpen={isResearchModalOpen} maxWidthClass="max-w-2xl">
	<AskClaudeToResearchPerson person={{ id: person.id, name: person.name }} />
</Modal>

<DangerConfirmModal
	title="Delete person"
	description={`This removes “${person.name}” from the People register, with their links and notes, and takes them off every company they sit on. Use it for someone added by mistake. This cannot be undone.`}
	action="?/deletePerson"
	fields={{ personId: person.id }}
	submitLabel="Delete person"
	bind:isOpen={isDeleteModalOpen}
/>
