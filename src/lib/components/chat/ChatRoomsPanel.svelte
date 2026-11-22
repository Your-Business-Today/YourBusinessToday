<script lang="ts">
	import ArchiveChatRoomForm from './ArchiveChatRoomForm.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import ChatRoomCells from './ChatRoomCells.svelte';
	import ChatRoomForm from './ChatRoomForm.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { paneToolbarClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
	import type { ListedChatRoom } from '$lib/data/chat/chatRoomTree';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let {
		organisationName,
		listedRooms,
		parentChoices
	}: { organisationName: string; listedRooms: ListedChatRoom[]; parentChoices: ChatRoom[] } = $props();

	let isNewRoomOpen = $state(false);
	let isEditRoomOpen = $state(false);
	let editedRoom = $state<ChatRoom | null>(null);

	const columns: RecordsColumn<ListedChatRoom>[] = [
		{ key: 'room', label: 'Room' },
		{ key: 'purpose', label: 'What it is for' },
		{ key: 'actions', label: '' }
	];
	const editTitle = $derived(`Edit ${editedRoom?.name ?? 'the room'}`);

	function openEditRoom(room: ChatRoom) {
		editedRoom = room;
		isEditRoomOpen = true;
	}

	function closeEditRoom() {
		isEditRoomOpen = false;
	}
</script>

<div class={paneToolbarClasses}>
	<Button look="primary" onclick={() => (isNewRoomOpen = true)}>New room</Button>
</div>

<DashboardPanel title="Rooms" count={listedRooms.length}>
	<RecordsTable
		label={`${organisationName}’s chat rooms`}
		{columns}
		rows={listedRooms}
		keyOf={(room) => room.id}
		isCardsOnPhone
		emptyMessage="No room is open yet."
	>
		{#snippet cells(room)}
			<ChatRoomCells {room} onEdit={openEditRoom} />
		{/snippet}
	</RecordsTable>
</DashboardPanel>

<Modal title={`New room for ${organisationName}`} bind:isOpen={isNewRoomOpen}>
	<ChatRoomForm action="?/createRoom" room={null} {parentChoices} submitLabel="Open the room" onSaved={() => (isNewRoomOpen = false)} />
</Modal>

<Modal title={editTitle} bind:isOpen={isEditRoomOpen}>
	{#if editedRoom !== null}
		{#key editedRoom.id}
			<ChatRoomForm action="?/changeRoom" room={editedRoom} {parentChoices} submitLabel="Save the room" onSaved={closeEditRoom} />
			{#if !editedRoom.isGeneral}
				<ArchiveChatRoomForm room={editedRoom} onArchived={closeEditRoom} />
			{/if}
		{/key}
	{/if}
</Modal>
