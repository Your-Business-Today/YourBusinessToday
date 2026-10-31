<script lang="ts">
	import ProjectRow from './ProjectRow.svelte';
	import ProjectTableHeader from './ProjectTableHeader.svelte';
	import { projectColumns, projectRowClasses, projectTableClasses } from './projectTableStyles';
	import { rowLink } from '$lib/client/rowLink';
	import { topRank } from '$lib/data/topRank';
	import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';

	let {
		projects,
		latestKitVersion,
		firstPositionNumber,
		projectCount,
		shownIds,
		onEdit,
		onDelete,
		onSetPriority
	}: {
		projects: ProjectSummary[];
		latestKitVersion: string;
		firstPositionNumber: number;
		projectCount: number;
		shownIds: string;
		onEdit: (project: ProjectSummary) => void;
		onDelete: (project: ProjectSummary) => void;
		onSetPriority: (project: ProjectSummary) => void;
	} = $props();
</script>

<ul class={projectTableClasses}>
	<ProjectTableHeader columns={projectColumns} />
	{#each projects as project, projectIndex (project.id)}
		{@const position = firstPositionNumber + projectIndex}
		<li use:rowLink={`/projects/${project.id}`} class={projectRowClasses}>
			<ProjectRow
				{project}
				{latestKitVersion}
				{position}
				{shownIds}
				isFirst={position === topRank}
				isLast={position === projectCount}
				{onEdit}
				{onDelete}
				{onSetPriority}
			/>
		</li>
	{/each}
</ul>
