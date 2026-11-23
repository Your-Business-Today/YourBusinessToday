<script lang="ts">
	import ChatComposer from './ChatComposer.svelte';
	import ChatDecisionRaiseForm from './ChatDecisionRaiseForm.svelte';
	import ChatMessageList from './ChatMessageList.svelte';
	import ChatMoveControl from './ChatMoveControl.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import { ChatMoveSelection } from './chatMoveSelection.svelte';
	import { LiveRefresh } from '$lib/client/liveRefresh.svelte';
	import { chatRoomDependency, chatRoomRefreshMilliseconds } from '$lib/data/chat/chatMessageRules';
	import { messagesIn } from '$lib/data/chat/chatRoomFlow';
	import { decisionsByMessage } from '$lib/data/chat/chatDecisionOrder';
	import type { ChatPerson, ListedChatDecision } from '$lib/data/chat/chatDecisionRules';
	import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
	import type { ChatRoomFlowEntry, ChatRoomMessage } from '$lib/server/chat/readChatFlowOfRoom';
	import type { ListedChatRoom } from '$lib/data/chat/chatRoomTree';

	let {
		organisationId,
		room,
		flow,
		destinations,
		decisions,
		people
	}: {
		organisationId: string;
		room: ChatRoom;
		flow: ChatRoomFlowEntry[];
		destinations: ListedChatRoom[];
		decisions: ListedChatDecision[];
		people: ChatPerson[];
	} = $props();

	new LiveRefresh(chatRoomDependency, chatRoomRefreshMilliseconds);

	const selection = new ChatMoveSelection();
	const hasPurpose = $derived(room.purpose !== '');
	const messages = $derived(messagesIn(flow));
	const hasMessages = $derived(messages.length > 0);
	const chosenIds = $derived(selection.chosenAmong(messages));
	const decisionsOfMessage = $derived(decisionsByMessage(decisions));

	let isRaiseOpen = $state(false);
	let raisingFrom = $state<ChatRoomMessage | null>(null);

	function openRaise(message: ChatRoomMessage) {
		raisingFrom = message;
		isRaiseOpen = true;
	}

	const onRaiseDecision = $derived(room.isArchived ? null : openRaise);
</script>

<DashboardPanel>
	{#snippet toolbar()}
		{#if hasPurpose}
			<p class="text-sm text-chalk-subtle">{room.purpose}</p>
		{/if}
		{#if room.isArchived}
			<p class="text-sm text-chalk-subtle">This room is archived: what was said in it stays here to read, and nothing more can be said.</p>
		{/if}
		{#if hasMessages}
			<ChatMoveControl roomName={room.name} {selection} {chosenIds} {destinations} />
		{/if}
	{/snippet}
	<ChatMessageList {organisationId} {flow} {messages} {selection} {decisionsOfMessage} {onRaiseDecision} />
	{#if !room.isArchived}
		<ChatComposer roomName={room.name} />
	{/if}
</DashboardPanel>

<Modal title="Raise a decision" bind:isOpen={isRaiseOpen}>
	{#if raisingFrom !== null}
		{#key raisingFrom.id}
			<ChatDecisionRaiseForm message={raisingFrom} {people} onRaised={() => (isRaiseOpen = false)} />
		{/key}
	{/if}
</Modal>
