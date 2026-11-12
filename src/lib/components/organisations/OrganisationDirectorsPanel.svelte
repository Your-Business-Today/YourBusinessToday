<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import NameDirectorForm from './NameDirectorForm.svelte';
	import OrganisationDirectorCells from './OrganisationDirectorCells.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { paneToolbarClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BoardroomDirector } from '$lib/data/boardroomDirector';
	import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let {
		directors,
		members,
		canName
	}: { directors: BoardroomDirector[]; members: OrganisationMember[]; canName: boolean } = $props();

	let isNameModalOpen = $state(false);

	const directorColumns: RecordsColumn<BoardroomDirector>[] = [
		{ key: 'director', label: 'Director', sortValue: (director) => director.name },
		{ key: 'since', label: 'Director since', sortValue: (director) => director.namedAt }
	];
	const actionsColumn: RecordsColumn<BoardroomDirector> = { key: 'actions', label: '' };
	const columns = $derived(canName ? [...directorColumns, actionsColumn] : directorColumns);
	const directorAccountIds = $derived(new Set(directors.map((director) => director.accountId)));
	const candidates = $derived(members.filter((member) => !directorAccountIds.has(member.id)));
	const canNameAnother = $derived(canName && candidates.length > 0);
</script>

{#if canNameAnother}
	<div class={paneToolbarClasses}>
		<Button onclick={() => (isNameModalOpen = true)}>Name a director</Button>
	</div>
{/if}

<DashboardPanel>
	<RecordsTable
		label="Directors"
		{columns}
		rows={directors}
		keyOf={(director) => director.id}
		isCardsOnPhone
		emptyMessage="No directors named yet. Only named directors enter the boardroom."
	>
		{#snippet cells(director)}
			<OrganisationDirectorCells {director} {canName} />
		{/snippet}
	</RecordsTable>
</DashboardPanel>

<Modal title="Name a director" bind:isOpen={isNameModalOpen}>
	<NameDirectorForm {candidates} onNamed={() => (isNameModalOpen = false)} />
</Modal>
