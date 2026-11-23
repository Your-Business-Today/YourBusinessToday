<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import ChatWhiteboardForm from './ChatWhiteboardForm.svelte';
	import ChatWhiteboardsTable from './ChatWhiteboardsTable.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import { whiteboardsTitle } from '$lib/data/chat/chatWhiteboardWords';
	import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
	import type { ListedChatWhiteboard } from '$lib/data/chat/chatWhiteboardRules';

	let { organisationId, room, whiteboards }: { organisationId: string; room: ChatRoom; whiteboards: ListedChatWhiteboard[] } = $props();

	let isOpen = $state(false);
</script>

<Button onclick={() => (isOpen = true)}>{whiteboardsTitle} · {whiteboards.length}</Button>

<Modal title={`${whiteboardsTitle} in ${room.name}`} bind:isOpen maxWidthClass="max-w-2xl">
	<div class="flex min-h-0 flex-col gap-6 overflow-y-auto">
		<ChatWhiteboardsTable {organisationId} {room} {whiteboards} />
		{#if !room.isArchived}
			<ChatWhiteboardForm />
		{/if}
	</div>
</Modal>
