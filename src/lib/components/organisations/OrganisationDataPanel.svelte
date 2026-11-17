<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import OrganisationExportCells from './OrganisationExportCells.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { paneToolbarClasses } from '$lib/components/workspace/workspaceStyles';
	import type { OrganisationExportRecord } from '$lib/server/organisationExport/organisationExportRecord';
	import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let {
		organisationName,
		exports,
		members,
		exportLinks
	}: { organisationName: string; exports: OrganisationExportRecord[]; members: OrganisationMember[]; exportLinks: string[] } = $props();

	const tracker = new FormTracker();
	const columns: RecordsColumn<OrganisationExportRecord>[] = [
		{ key: 'when', label: 'Exported', sortValue: (record) => record.exportedAt },
		{ key: 'by', label: 'By' },
		{ key: 'held', label: 'What it held' }
	];
	const partLabel = (index: number) => (exportLinks.length === 1 ? 'Download the export' : `Download part ${index + 1} of ${exportLinks.length}`);
</script>

<div class={paneToolbarClasses}>
	<form method="POST" action="?/exportData" use:enhance={tracker.submit()} class="inline-flex">
		<Button type="submit" isSaving={tracker.isSaving}>Export everything</Button>
	</form>
</div>

<DashboardPanel title="Take your data with you" isPadded>
	<p class="text-sm text-chalk-subtle">
		Everything {organisationName} keeps here, whenever you like: a CSV for each table of your Books, Your Business Brain,
		Boardroom, Brand and workflow map, and every file you stored, in its original format. Records your company portal keeps
		are exported from the portal's own Data protection page. A large export comes as several zips. Every export is logged below.
	</p>
	{#if exportLinks.length > 0}
		<ul class="mt-3 space-y-1 text-sm">
			{#each exportLinks as link, index (link)}
				<li><a class="font-medium text-go underline-offset-2 hover:underline" href={link}>{partLabel(index)}</a></li>
			{/each}
		</ul>
	{/if}
</DashboardPanel>

<DashboardPanel>
	<RecordsTable label="Exports" {columns} rows={exports} keyOf={(record) => record.id} isCardsOnPhone emptyMessage="Nothing has been exported yet.">
		{#snippet cells(record)}
			<OrganisationExportCells {record} {members} />
		{/snippet}
	</RecordsTable>
</DashboardPanel>
