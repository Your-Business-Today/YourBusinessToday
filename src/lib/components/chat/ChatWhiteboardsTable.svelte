<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { chatWhiteboardPath } from '$lib/data/chat/chatPaths';
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
	import type { ListedChatWhiteboard } from '$lib/data/chat/chatWhiteboardRules';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { organisationId, room, whiteboards }: { organisationId: string; room: ChatRoom; whiteboards: ListedChatWhiteboard[] } = $props();

	const columns: RecordsColumn<ListedChatWhiteboard>[] = [
		{ key: 'title', label: 'Whiteboard' },
		{ key: 'lastSavedBy', label: 'Last saved by' },
		{ key: 'lastSavedAt', label: 'When' }
	];
	const hasWhiteboards = $derived(whiteboards.length > 0);
	const noWhiteboardsYet = 'No whiteboard has been started in this room yet.';
	const boardPathOf = (board: ListedChatWhiteboard) => chatWhiteboardPath(organisationId, room.id, board.id);
</script>

{#if hasWhiteboards}
	<RecordsTable label={`The whiteboards of ${room.name}, the latest saved first`} {columns} rows={whiteboards} keyOf={(board) => board.id} hrefOf={boardPathOf} isCardsOnPhone>
		{#snippet cells(board)}
			<RecordsCell kind="link" href={boardPathOf(board)}>{board.title}</RecordsCell>
			<RecordsCell label="Last saved by">{board.lastSavedByName}</RecordsCell>
			<RecordsCell label="When">{formatBritishDateTime(board.updatedAt)}</RecordsCell>
		{/snippet}
	</RecordsTable>
{:else}
	<EmptyState message={noWhiteboardsYet} />
{/if}
