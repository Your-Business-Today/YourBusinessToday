<script lang="ts">
	import DraftApproachForm from '$lib/components/people/DraftApproachForm.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import NewContactForm from './NewContactForm.svelte';
	import PersonCard from './PersonCard.svelte';
	import PersonFieldsForm from '$lib/components/people/PersonFieldsForm.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { primaryButtonClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import type { ApproachDraft } from '$lib/server/people/draftApproach';
	import type { ClientPerson } from '$lib/server/clients/getPeopleForClient';

	let {
		people,
		approachDraft,
		canImportOfficers
	}: { people: ClientPerson[]; approachDraft: ApproachDraft | null; canImportOfficers: boolean } = $props();

	let isNewContactModalOpen = $state(false);
	let personBeingEdited = $state<ClientPerson | null>(null);
	let isEditModalOpen = $state(false);
	let isApproachModalOpen = $state(false);

	$effect(() => {
		isApproachModalOpen = approachDraft !== null;
	});

	function edit(person: ClientPerson) {
		personBeingEdited = person;
		isEditModalOpen = true;
	}
</script>

<section class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h2 class="font-display text-xl">People</h2>
		<div class="flex flex-wrap gap-2">
			{#if canImportOfficers}
				<form method="POST" action="?/importOfficers">
					<SubmitButton class={quietButtonClasses} savingLabel="Reading the register…">
						Import officers from Companies House
					</SubmitButton>
				</form>
			{/if}
			<button class={primaryButtonClasses} onclick={() => (isNewContactModalOpen = true)}>
				Add contact
			</button>
		</div>
	</div>
	{#if people.length === 0}
		<p class="text-sm text-chalk/50">Nobody listed yet.</p>
	{/if}
	{#each people as person (person.contactId)}
		<PersonCard {person} onEdit={edit} />
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

<Modal title="Draft approach" bind:isOpen={isApproachModalOpen} maxWidthClass="max-w-2xl">
	{#if approachDraft !== null}
		<DraftApproachForm draft={approachDraft} />
	{/if}
</Modal>
