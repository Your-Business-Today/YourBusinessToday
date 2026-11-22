<script lang="ts">
	import ChatComposer from './ChatComposer.svelte';
	import ChatMessageList from './ChatMessageList.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { LiveRefresh } from '$lib/client/liveRefresh.svelte';
	import { chatRoomDependency, chatRoomRefreshMilliseconds } from '$lib/data/chat/chatMessageRules';
	import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
	import type { NamedChatMessage } from '$lib/server/chat/readChatMessages';

	let { room, messages }: { room: ChatRoom; messages: NamedChatMessage[] } = $props();

	new LiveRefresh(chatRoomDependency, chatRoomRefreshMilliseconds);

	const hasPurpose = $derived(room.purpose !== '');
</script>

<DashboardPanel>
	{#snippet toolbar()}
		{#if hasPurpose}
			<p class="text-sm text-chalk-subtle">{room.purpose}</p>
		{/if}
		{#if room.isArchived}
			<p class="text-sm text-chalk-subtle">This room is archived: what was said in it stays here to read, and nothing more can be said.</p>
		{/if}
	{/snippet}
	<ChatMessageList {messages} />
	{#if !room.isArchived}
		<ChatComposer roomName={room.name} />
	{/if}
</DashboardPanel>
