<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { conversationChannelLabels, type LeadConversation } from '$lib/data/leadConversationRules';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { quietButtonClasses } from '$lib/components/site/formStyles';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { conversations, onRead }: { conversations: LeadConversation[]; onRead: (conversation: LeadConversation) => void } = $props();

	const columns: RecordsColumn<LeadConversation>[] = [
		{ key: 'heldOn', label: 'When', sortValue: (conversation) => conversation.heldOn },
		{ key: 'channel', label: 'How', isWideOnly: true },
		{ key: 'heldBy', label: 'Ours', isWideOnly: true },
		{ key: 'person', label: 'With' },
		{ key: 'summary', label: 'Summary' },
		{ key: 'read', label: '' }
	];
</script>

<RecordsTable
	label="Conversations"
	{columns}
	rows={conversations}
	keyOf={(conversation) => conversation.id}
	isCardsOnPhone
	emptyMessage="No conversations logged yet."
>
	{#snippet cells(conversation)}
		<RecordsCell label="When">{formatBritishDate(conversation.heldOn)}</RecordsCell>
		<RecordsCell label="How" isWideOnly>{conversationChannelLabels[conversation.channel]}</RecordsCell>
		<RecordsCell label="Ours" isWideOnly>{conversation.heldByName}</RecordsCell>
		<RecordsCell label="With">{conversation.personName}</RecordsCell>
		<RecordsCell label="Summary"><span class="line-clamp-2">{conversation.summary}</span></RecordsCell>
		<RecordsCell kind="actions">
			<button class={quietButtonClasses} onclick={() => onRead(conversation)}>Read</button>
		</RecordsCell>
	{/snippet}
</RecordsTable>
