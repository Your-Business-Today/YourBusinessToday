<script lang="ts">
	import ChatMessageChoice from './ChatMessageChoice.svelte';
	import ChatMessageFiles from './ChatMessageFiles.svelte';
	import ProseText from '$lib/components/site/ProseText.svelte';
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import { movedHereNote } from '$lib/data/chat/chatRoomFlow';
	import { postedViaChannels } from '$lib/data/conversationTurn';
	import type { ChatMoveSelection } from './chatMoveSelection.svelte';
	import type { ChatRoomMessage } from '$lib/server/chat/readChatFlowOfRoom';

	let {
		organisationId,
		message,
		selection,
		onChooseFromHere
	}: { organisationId: string; message: ChatRoomMessage; selection: ChatMoveSelection; onChooseFromHere: (messageId: string) => void } = $props();

	const hasWords = $derived(message.body !== '');
	const isByClaude = $derived(message.postedVia === postedViaChannels.claude);
	const movedNote = $derived(message.movedHere === null ? null : movedHereNote(message.movedHere));
</script>

<li class="flex gap-3 px-4 py-3">
	{#if selection.isMoving}
		<ChatMessageChoice
			authorName={message.authorName}
			isChosen={selection.isChosen(message.id)}
			onToggle={() => selection.toggle(message.id)}
			onChooseFromHere={() => onChooseFromHere(message.id)}
		/>
	{/if}
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<p class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-chalk-subtle">
			<span class="font-display text-chalk">{message.authorName}</span>
			{#if isByClaude}
				<span title="Written by their Claude through the connector" class="font-display text-caution">✦ via Claude</span>
			{/if}
			<time datetime={message.createdAt}>· {formatBritishDateTime(message.createdAt)}</time>
			{#if movedNote !== null}
				<span class="text-chalk-faint">· {movedNote}</span>
			{/if}
		</p>
		{#if hasWords}
			<ProseText text={message.body} class="text-chalk/90" />
		{/if}
		<ChatMessageFiles {organisationId} files={message.files} />
	</div>
</li>
