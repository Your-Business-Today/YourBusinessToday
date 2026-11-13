<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { businessBrainPartNames } from '$lib/data/businessBrainRules';
	import { partBadgeTones } from './businessBrainIndex';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { brains, canReadQuestions, addresses }: { brains: BusinessBrainChatbot[]; canReadQuestions: boolean; addresses: BusinessBrainAddresses } =
		$props();

	const columns: RecordsColumn<BusinessBrainChatbot>[] = [
		{ key: 'name', label: 'Brain', sortValue: (brain) => brain.name },
		{ key: 'purpose', label: 'What it is for' },
		{ key: 'reads', label: 'Reads', isWideOnly: true },
		{ key: 'people', label: 'People', isFigure: true, sortValue: ({ people }) => people.length }
	];
	const emptyMessage = 'No brain is made yet. A manager makes one through the connector, saying what it is for, what it may read and who uses it.';
	const questionsHrefOf = $derived(canReadQuestions ? (brain: BusinessBrainChatbot) => addresses.chatbotQuestions(brain.chatbotId) : undefined);
</script>

<RecordsTable label="Brains" {columns} rows={brains} keyOf={(brain) => brain.chatbotId} hrefOf={questionsHrefOf} isCardsOnPhone {emptyMessage}>
	{#snippet cells(brain)}
		{@const { people } = brain}
		<RecordsCell kind="link" href={questionsHrefOf?.(brain)}>{brain.name}</RecordsCell>
		<RecordsCell label="What it is for">
			{#if brain.purpose === ''}
				<span class="text-chalk-subtle">No purpose given yet.</span>
			{:else}
				{brain.purpose}
			{/if}
		</RecordsCell>
		<RecordsCell isWideOnly>
			<span class="flex flex-wrap gap-1.5">
				{#each brain.parts as part (part)}
					<Badge label={businessBrainPartNames[part]} tone={partBadgeTones[part]} />
				{/each}
			</span>
		</RecordsCell>
		<RecordsCell kind="figure" label="People">{people.length}</RecordsCell>
	{/snippet}
</RecordsTable>
