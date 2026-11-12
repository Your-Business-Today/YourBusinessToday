<script lang="ts">
	import LeadConversationForm from './LeadConversationForm.svelte';
	import LeadConversationRead from './LeadConversationRead.svelte';
	import LeadConversationTable from './LeadConversationTable.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import { primaryButtonClasses } from '$lib/components/site/formStyles';
	import type { ClientPerson } from '$lib/server/clients/getPeopleForClient';
	import type { LeadConversation } from '$lib/data/leadConversationRules';
	import type { StaffMember } from '$lib/server/projects/getStaffDirectory';

	let {
		conversations,
		people,
		staffMembers,
		viewerId
	}: { conversations: LeadConversation[]; people: ClientPerson[]; staffMembers: StaffMember[]; viewerId: string } = $props();

	let isLogModalOpen = $state(false);
	let conversationBeingRead = $state<LeadConversation | null>(null);
	let isReadModalOpen = $state(false);

	function read(conversation: LeadConversation) {
		conversationBeingRead = conversation;
		isReadModalOpen = true;
	}
</script>

<section class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h2 class="font-display text-xl">Conversations</h2>
		<button class={primaryButtonClasses} onclick={() => (isLogModalOpen = true)}>Log a conversation</button>
	</div>
	<LeadConversationTable {conversations} onRead={read} />
</section>

<Modal title="Log a conversation" bind:isOpen={isLogModalOpen} maxWidthClass="max-w-2xl">
	<LeadConversationForm {people} {staffMembers} {viewerId} />
</Modal>

<Modal title="Conversation" bind:isOpen={isReadModalOpen} maxWidthClass="max-w-2xl">
	{#if conversationBeingRead !== null}
		<LeadConversationRead conversation={conversationBeingRead} />
	{/if}
</Modal>
