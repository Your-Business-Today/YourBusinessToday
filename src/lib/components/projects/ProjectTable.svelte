<script lang="ts">
	import ProjectRow from './ProjectRow.svelte';
	import ProjectTableHeader from './ProjectTableHeader.svelte';
	import { projectColumns, projectRowClasses, projectTableClasses } from './projectTableStyles';
	import { flip } from 'svelte/animate';
	import { rowMove } from '$lib/client/motion';
	import { rowLink } from '$lib/client/rowLink';
	import type { ProjectListRow } from '$lib/client/projectListView.svelte';
	import type { ListedProject } from '$lib/server/projects/getProjectsForUser';

	let {
		rows,
		latestKitVersion,
		shownIds,
		onEdit,
		onDelete,
		onSetPriority
	}: {
		rows: ProjectListRow[];
		latestKitVersion: string;
		shownIds: string;
		onEdit: (project: ListedProject) => void;
		onDelete: (project: ListedProject) => void;
		onSetPriority: (project: ListedProject) => void;
	} = $props();
</script>

<ul class={projectTableClasses}>
	<ProjectTableHeader columns={projectColumns} />
	{#each rows as row (row.id)}
		<li animate:flip={rowMove} use:rowLink={`/projects/${row.id}`} class={projectRowClasses}>
			<ProjectRow {row} {latestKitVersion} {shownIds} {onEdit} {onDelete} {onSetPriority} />
		</li>
	{/each}
</ul>
