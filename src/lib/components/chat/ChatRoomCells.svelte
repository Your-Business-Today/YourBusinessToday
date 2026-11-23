<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import ChatUnreadBadge from './ChatUnreadBadge.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import { chatRoomPath } from '$lib/data/chat/chatPaths';
	import type { ChatRoomWithUnread } from '$lib/data/chat/chatUnreadCounts';

	let {
		organisationId,
		room,
		onEdit
	}: { organisationId: string; room: ChatRoomWithUnread; onEdit: (room: ChatRoomWithUnread) => void } = $props();
</script>

<RecordsCell kind="link" href={chatRoomPath(organisationId, room.id)}>
	<span class={[room.isSubroom && 'pl-6 text-chalk-subtle']}>{room.name}</span>
</RecordsCell>
<RecordsCell label="What it is for">{room.purpose}</RecordsCell>
<RecordsCell kind="status" label="New">
	<ChatUnreadBadge unreadCount={room.unreadCount} />
</RecordsCell>
<RecordsCell kind="actions">
	<Button look="ghost" onclick={() => onEdit(room)}>Edit</Button>
</RecordsCell>
