<script lang="ts">
	import ChatUnreadBadge from './ChatUnreadBadge.svelte';
	import { chatRoomPath } from '$lib/data/chat/chatPaths';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ChatRoomWithUnread } from '$lib/data/chat/chatUnreadCounts';

	let {
		organisationId,
		rooms,
		openRoomId
	}: { organisationId: string; rooms: ChatRoomWithUnread[]; openRoomId: string } = $props();

	const roomLinkClasses = 'flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-carriage-raised hover:text-chalk';
	const openRoomClasses = 'bg-carriage-raised font-medium text-chalk';
	const otherRoomClasses = 'text-chalk-muted';
</script>

<nav aria-label="Rooms">
	<ul class={panelListClasses}>
		{#each rooms as room (room.id)}
			{@const isOpen = room.id === openRoomId}
			<li>
				<a
					href={chatRoomPath(organisationId, room.id)}
					aria-current={isOpen ? 'page' : undefined}
					class={[roomLinkClasses, isOpen ? openRoomClasses : otherRoomClasses]}
				>
					<span class={['min-w-0 truncate', room.isSubroom && 'pl-4']}>{room.name}</span>
					<ChatUnreadBadge unreadCount={room.unreadCount} />
				</a>
			</li>
		{/each}
	</ul>
</nav>
