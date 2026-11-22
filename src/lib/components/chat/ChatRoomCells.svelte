<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import type { ListedChatRoom } from '$lib/data/chat/chatRoomTree';

	let { room, onEdit }: { room: ListedChatRoom; onEdit: (room: ListedChatRoom) => void } = $props();
</script>

<RecordsCell kind="link">
	<span class={[room.isSubroom && 'pl-6 text-chalk-subtle']}>{room.name}</span>
</RecordsCell>
<RecordsCell label="What it is for">{room.purpose}</RecordsCell>
<RecordsCell kind="actions">
	<Button look="ghost" onclick={() => onEdit(room)}>Edit</Button>
</RecordsCell>
