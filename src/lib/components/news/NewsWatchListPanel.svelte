<script lang="ts">
	import AddWatchedThingForm from './AddWatchedThingForm.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import WatchListSuggestionsForm from './WatchListSuggestionsForm.svelte';
	import WatchedThingCells from './WatchedThingCells.svelte';
	import { paneToolbarClasses } from '$lib/components/workspace/workspaceStyles';
	import { watchedKindLabels, type WatchedThing, type WatchedThingGiven } from '$lib/data/news/watchListRules';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let {
		organisationName,
		watchList,
		suggestions,
		canKeep
	}: { organisationName: string; watchList: WatchedThing[]; suggestions: WatchedThingGiven[]; canKeep: boolean } = $props();

	let isAddModalOpen = $state(false);

	const watchedColumns: RecordsColumn<WatchedThing>[] = [
		{ key: 'value', label: 'Watched', sortValue: (watched) => watched.value },
		{ key: 'kind', label: 'Kind', sortValue: (watched) => watchedKindLabels[watched.kind] },
		{ key: 'label', label: 'Called', sortValue: (watched) => watched.label },
		{ key: 'added', label: 'Added', sortValue: (watched) => watched.addedAt }
	];
	const actionsColumn: RecordsColumn<WatchedThing> = { key: 'actions', label: '' };
	const columns = $derived(canKeep ? [...watchedColumns, actionsColumn] : watchedColumns);
</script>

{#if canKeep}
	<div class={paneToolbarClasses}>
		<Button look="primary" onclick={() => (isAddModalOpen = true)}>Add to watch list</Button>
	</div>
{/if}

<DashboardPanel title="Watch list" count={watchList.length}>
	<RecordsTable
		label={`What ${organisationName}’s Business News watches`}
		{columns}
		rows={watchList}
		keyOf={(watched) => watched.id}
		isCardsOnPhone
		emptyMessage={`${organisationName}’s Business News watches nothing yet.`}
	>
		{#snippet cells(watched)}
			<WatchedThingCells watchedThing={watched} {canKeep} />
		{/snippet}
	</RecordsTable>
</DashboardPanel>

{#if canKeep && suggestions.length > 0}
	<DashboardPanel title="Suggestions to watch" count={suggestions.length}>
		<WatchListSuggestionsForm {suggestions} />
	</DashboardPanel>
{/if}

<Modal title={`Watch something for ${organisationName}`} bind:isOpen={isAddModalOpen}>
	<AddWatchedThingForm onAdded={() => (isAddModalOpen = false)} />
</Modal>
