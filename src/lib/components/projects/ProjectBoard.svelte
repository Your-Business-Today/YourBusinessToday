<script lang="ts">
	import ProjectFilterBar from './ProjectFilterBar.svelte';
	import ProjectPagination from './ProjectPagination.svelte';
	import ProjectTable from './ProjectTable.svelte';
	import type { ProjectListView } from '$lib/client/projectListView.svelte';
	import type { ListedProject } from '$lib/server/projects/getProjectsForUser';

	let {
		listView,
		latestKitVersion,
		onEdit,
		onDelete,
		onSetPriority
	}: {
		listView: ProjectListView;
		latestKitVersion: string;
		onEdit: (project: ListedProject) => void;
		onDelete: (project: ListedProject) => void;
		onSetPriority: (project: ListedProject) => void;
	} = $props();
</script>

<ProjectFilterBar
	bind:searchText={listView.searchText}
	bind:selectedStatus={listView.selectedStatus}
	bind:isShowingFinished={listView.isShowingFinished}
	finishedCount={listView.finishedCount}
	countLabel={listView.countLabel}
/>
{#if listView.matchCount === 0}
	<p class="rounded-xl border border-dashed border-hairline p-8 text-center text-sm text-chalk/60">
		No projects match — adjust the filters or create one.
	</p>
{:else}
	<ProjectTable
		rows={listView.pagedRows}
		{latestKitVersion}
		shownIds={listView.shownIds}
		{onEdit}
		{onDelete}
		{onSetPriority}
	/>
	<ProjectPagination bind:pageNumber={listView.pageNumber} pageCount={listView.pageCount} />
{/if}
