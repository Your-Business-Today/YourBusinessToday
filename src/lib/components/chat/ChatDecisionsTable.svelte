<script lang="ts">
	import ChatDecisionCells from './ChatDecisionCells.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { decisionsTitle } from '$lib/data/chat/chatDecisionWords';
	import type { ListedChatDecision } from '$lib/data/chat/chatDecisionRules';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { organisation, decisions }: { organisation: { id: string; name: string }; decisions: ListedChatDecision[] } = $props();

	const columns: RecordsColumn<ListedChatDecision>[] = [
		{ key: 'wording', label: 'Decision' },
		{ key: 'room', label: 'Room' },
		{ key: 'waitingOn', label: 'Waiting on' },
		{ key: 'raisedBy', label: 'Raised by' },
		{ key: 'status', label: 'Status' },
		{ key: 'outcome', label: 'Outcome' }
	];
	const hasDecisions = $derived(decisions.length > 0);
	const noDecisionsYet = 'No decision has been raised in any room yet. Raise one from the message it came from, in its room.';
</script>

{#if hasDecisions}
	<DashboardPanel title={decisionsTitle} count={decisions.length}>
		<RecordsTable label={`${organisation.name}’s chat decisions, open ones first`} {columns} rows={decisions} keyOf={(decision) => decision.id} isCardsOnPhone>
			{#snippet cells(decision)}
				<ChatDecisionCells organisationId={organisation.id} {decision} />
			{/snippet}
		</RecordsTable>
	</DashboardPanel>
{:else}
	<EmptyState message={noDecisionsYet} />
{/if}
