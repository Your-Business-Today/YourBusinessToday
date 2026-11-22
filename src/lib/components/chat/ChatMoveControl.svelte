<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import ChatMoveForm from './ChatMoveForm.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import type { ChatMoveSelection } from './chatMoveSelection.svelte';
	import type { ListedChatRoom } from '$lib/data/chat/chatRoomTree';

	let {
		roomName,
		selection,
		chosenIds,
		destinations
	}: { roomName: string; selection: ChatMoveSelection; chosenIds: string[]; destinations: ListedChatRoom[] } = $props();

	let isConfirmOpen = $state(false);

	const hasChosen = $derived(chosenIds.length > 0);

	function endAfterMoving() {
		isConfirmOpen = false;
		selection.end();
	}
</script>

<div class="flex flex-wrap items-center justify-end gap-2">
	{#if selection.isMoving}
		<p class="text-sm text-chalk-subtle" aria-live="polite">
			{chosenIds.length} chosen: tick messages, or pick one and take it and everything after it.
		</p>
		<Button look="ghost" onclick={() => selection.end()}>Cancel</Button>
		<Button look="primary" disabled={!hasChosen} onclick={() => (isConfirmOpen = true)}>Move to a room…</Button>
	{:else}
		<Button onclick={() => selection.start()}>Move to room</Button>
	{/if}
</div>

<Modal title={`Move messages out of ${roomName}`} bind:isOpen={isConfirmOpen}>
	<ChatMoveForm {roomName} {chosenIds} {destinations} onMoved={endAfterMoving} />
</Modal>
