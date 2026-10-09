<script lang="ts">
	import ProjectFilterBar from './ProjectFilterBar.svelte';
	import ProjectPagination from './ProjectPagination.svelte';
	import ProjectTileGrid from './ProjectTileGrid.svelte';
	import type { ProjectListView } from '$lib/client/projectListView.svelte';
	import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';

	let {
		listView,
		latestKitVersion,
		onEdit,
		onDelete,
		onSetPriority
	}: {
		listView: ProjectListView;
		latestKitVersion: string;
		onEdit: (project: ProjectSummary) => void;
		onDelete: (project: ProjectSummary) => void;
		onSetPriority: (project: ProjectSummary) => void;
	} = $props();
</script>

<ProjectFilterBar
	bind:searchText={listView.searchText}
	bind:selectedStatus={listView.selectedStatus}
	countLabel={listView.countLabel}
/>
{#if listView.filteredProjects.length === 0}
	<p class="rounded-xl border border-dashed border-hairline p-8 text-center text-sm text-chalk/60">
		No projects match — adjust the filters or create one.
	</p>
{:else}
	<ProjectTileGrid
		projects={listView.pagedProjects}
		{latestKitVersion}
		firstPositionNumber={listView.firstPositionNumber}
		projectCount={listView.filteredProjects.length}
		{onEdit}
		{onDelete}
		{onSetPriority}
	/>
	<ProjectPagination bind:pageNumber={listView.pageNumber} pageCount={listView.pageCount} />
{/if}
