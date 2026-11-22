<script lang="ts">
	import ChatMessageRow from './ChatMessageRow.svelte';
	import ChatMoveMarker from './ChatMoveMarker.svelte';
	import { chatFlowKinds } from '$lib/data/chat/chatRoomFlow';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ChatMoveSelection } from './chatMoveSelection.svelte';
	import type { ChatRoomFlowEntry, ChatRoomMessage } from '$lib/server/chat/readChatFlowOfRoom';

	let {
		organisationId,
		flow,
		messages,
		selection
	}: { organisationId: string; flow: ChatRoomFlowEntry[]; messages: ChatRoomMessage[]; selection: ChatMoveSelection } = $props();

	const nearTheBottomPixels = 120;
	const lastPlace = -1;

	let list = $state<HTMLUListElement | null>(null);
	let isFollowingTheNewest = true;

	const newestEntry = $derived(flow.at(lastPlace));
	const newestEntryKey = $derived(newestEntry?.key ?? null);

	function isReaderNearTheBottom(): boolean {
		const page = document.documentElement;
		const distanceLeft = page.scrollHeight - window.scrollY - window.innerHeight;
		return distanceLeft < nearTheBottomPixels;
	}

	function showTheNewest() {
		const newestRow = list?.lastElementChild;
		newestRow?.scrollIntoView({ block: 'end' });
	}

	function chooseFromHere(messageId: string) {
		selection.chooseFromHereOnwards(messages, messageId);
	}

	$effect.pre(() => {
		void newestEntryKey;
		if (list === null) return;
		isFollowingTheNewest = isReaderNearTheBottom();
	});

	$effect(() => {
		void newestEntryKey;
		if (isFollowingTheNewest) showTheNewest();
	});
</script>

{#if flow.length === 0}
	<p class={panelEmptyClasses}>Nothing has been said in this room yet.</p>
{:else}
	<ul bind:this={list} class={panelListClasses} aria-label="Messages, oldest first">
		{#each flow as entry (entry.key)}
			{#if entry.kind === chatFlowKinds.message}
				<ChatMessageRow message={entry.message} {selection} onChooseFromHere={chooseFromHere} />
			{:else}
				<ChatMoveMarker {organisationId} marker={entry.marker} />
			{/if}
		{/each}
	</ul>
{/if}
