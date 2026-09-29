<script lang="ts">
	import ProjectFilterBar from './ProjectFilterBar.svelte';
	import ProjectPagination from './ProjectPagination.svelte';
	import ProjectTileGrid from './ProjectTileGrid.svelte';
	import type { ProjectListView } from '$lib/client/projectListView.svelte';
	import type { ProjectSummary } from '$lib/server/projects/getProjectList';

	let {
		listView,
		onEdit,
		onDelete,
		onSetPriority
	}: {
		listView: ProjectListView;
		onEdit: (project: ProjectSummary) => void;
		onDelete: (project: ProjectSummary) => void;
		onSetPriority: (project: ProjectSummary) => void;
	} = $props();
</script>

<div class="flex flex-col gap-2">
	<ProjectFilterBar bind:searchText={listView.searchText} bind:selectedStatus={listView.selectedStatus} />
	<p class="text-right font-display text-sm text-chalk/50">{listView.countLabel}</p>
</div>
{#if listView.filteredProjects.length === 0}
	<p class="rounded-2xl border border-dashed border-hairline p-8 text-center text-chalk/60">
		No projects match — adjust the filters or create one.
	</p>
{:else}
	<ProjectTileGrid
		projects={listView.pagedProjects}
		firstPositionNumber={listView.firstPositionNumber}
		projectCount={listView.filteredProjects.length}
		{onEdit}
		{onDelete}
		{onSetPriority}
	/>
	<ProjectPagination bind:pageNumber={listView.pageNumber} pageCount={listView.pageCount} />
{/if}
