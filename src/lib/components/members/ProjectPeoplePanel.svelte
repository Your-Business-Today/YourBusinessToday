<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import InvitePersonForm from './InvitePersonForm.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import PersonRow from './PersonRow.svelte';
	import TransferOwnershipForm from './TransferOwnershipForm.svelte';
	import { panelButtonClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let { people, isOwner }: { people: ProjectPerson[]; isOwner: boolean } = $props();

	let isInviteModalOpen = $state(false);
	let isTransferModalOpen = $state(false);
	let isRemoveModalOpen = $state(false);
	let personAwaitingRemoval = $state<ProjectPerson | null>(null);

	const members = $derived(people.filter((person) => !person.isOwner));

	function openRemoveModal(person: ProjectPerson) {
		personAwaitingRemoval = person;
		isRemoveModalOpen = true;
	}
</script>

<DashboardPanel title="People" count={people.length}>
	{#snippet actions()}
		{#if isOwner && members.length > 0}
			<button type="button" onclick={() => (isTransferModalOpen = true)} class={panelButtonClasses}>
				Transfer
			</button>
		{/if}
		<button type="button" onclick={() => (isInviteModalOpen = true)} class={panelButtonClasses}>
			＋ Invite
		</button>
	{/snippet}
	<ul class={panelListClasses}>
		{#each people as person (person.id)}
			<PersonRow {person} canRemove={!person.isOwner} onRemove={openRemoveModal} />
		{/each}
	</ul>
	{#if members.length === 0}
		<p class="border-t border-hairline px-4 py-3 text-sm text-chalk/60">
			It is just you so far. Invite someone and they can work this project with you.
		</p>
	{/if}
</DashboardPanel>

<Modal title="Invite someone" bind:isOpen={isInviteModalOpen}>
	<InvitePersonForm onInvited={() => (isInviteModalOpen = false)} />
</Modal>

<Modal title="Transfer ownership" bind:isOpen={isTransferModalOpen}>
	<TransferOwnershipForm {members} onTransferred={() => (isTransferModalOpen = false)} />
</Modal>

{#if personAwaitingRemoval !== null}
	<DangerConfirmModal
		title="Remove from project"
		description={`Remove ${personAwaitingRemoval.name} from this project? They lose access straight away; nothing they said or did is deleted.`}
		action="?/removeMember"
		fields={{ accountId: personAwaitingRemoval.id }}
		submitLabel="Remove"
		bind:isOpen={isRemoveModalOpen}
	/>
{/if}
