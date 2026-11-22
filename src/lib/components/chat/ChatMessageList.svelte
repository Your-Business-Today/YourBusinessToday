<script lang="ts">
	import ChatMessageRow from './ChatMessageRow.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { NamedChatMessage } from '$lib/server/chat/readChatMessages';

	let { messages }: { messages: NamedChatMessage[] } = $props();

	const nearTheBottomPixels = 120;
	const lastPlace = -1;

	let list = $state<HTMLUListElement | null>(null);
	let isFollowingTheNewest = true;

	const newestMessage = $derived(messages.at(lastPlace));
	const newestMessageId = $derived(newestMessage?.id ?? null);

	function isReaderNearTheBottom(): boolean {
		const page = document.documentElement;
		const distanceLeft = page.scrollHeight - window.scrollY - window.innerHeight;
		return distanceLeft < nearTheBottomPixels;
	}

	function showTheNewest() {
		const newestRow = list?.lastElementChild;
		newestRow?.scrollIntoView({ block: 'end' });
	}

	$effect.pre(() => {
		void newestMessageId;
		if (list === null) return;
		isFollowingTheNewest = isReaderNearTheBottom();
	});

	$effect(() => {
		void newestMessageId;
		if (isFollowingTheNewest) showTheNewest();
	});
</script>

{#if messages.length === 0}
	<p class={panelEmptyClasses}>Nothing has been said in this room yet.</p>
{:else}
	<ul bind:this={list} class={panelListClasses} aria-label="Messages, oldest first">
		{#each messages as message (message.id)}
			<ChatMessageRow {message} />
		{/each}
	</ul>
{/if}
