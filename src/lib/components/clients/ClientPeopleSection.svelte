<script lang="ts">
	import ClientPeopleActions from './ClientPeopleActions.svelte';
	import AskClaudeToDraftApproach from '$lib/components/people/AskClaudeToDraftApproach.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import NewContactForm from './NewContactForm.svelte';
	import PersonCard from './PersonCard.svelte';
	import PersonFieldsForm from '$lib/components/people/PersonFieldsForm.svelte';
	import type { ClientPerson } from '$lib/server/clients/getPeopleForClient';

	let { people, canImportOfficers }: { people: ClientPerson[]; canImportOfficers: boolean } = $props();

	let isNewContactModalOpen = $state(false);
	let personBeingEdited = $state<ClientPerson | null>(null);
	let isEditModalOpen = $state(false);
	let personToApproach = $state<ClientPerson | null>(null);
	let isApproachModalOpen = $state(false);

	function edit(person: ClientPerson) {
		personBeingEdited = person;
		isEditModalOpen = true;
	}

	function draftApproach(person: ClientPerson) {
		personToApproach = person;
		isApproachModalOpen = true;
	}
</script>

<section class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h2 class="font-display text-xl">People</h2>
		<ClientPeopleActions {canImportOfficers} onAddContact={() => (isNewContactModalOpen = true)} />
	</div>
	{#if people.length === 0}
		<p class="text-sm text-chalk/50">Nobody listed yet.</p>
	{/if}
	{#each people as person (person.contactId)}
		<PersonCard {person} onEdit={edit} onDraftApproach={draftApproach} />
	{/each}
</section>

<Modal title="New contact" bind:isOpen={isNewContactModalOpen}>
	<NewContactForm />
</Modal>

<Modal title="Edit person" bind:isOpen={isEditModalOpen} maxWidthClass="max-w-2xl">
	{#if personBeingEdited !== null}
		<PersonFieldsForm
			person={personBeingEdited}
			contactId={personBeingEdited.contactId}
			role={personBeingEdited.role}
		/>
	{/if}
</Modal>

<Modal title="Draft the approach with your Claude" bind:isOpen={isApproachModalOpen} maxWidthClass="max-w-2xl">
	{#if personToApproach !== null}
		<AskClaudeToDraftApproach person={{ id: personToApproach.id, name: personToApproach.name }} />
	{/if}
</Modal>
