<script lang="ts">
	import ProjectTile from './ProjectTile.svelte';
	import { projectTileGridClasses } from './projectTileStyles';
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

<ul class={projectTileGridClasses}>
	{#each projects as project, projectIndex (project.id)}
		{@const position = firstPositionNumber + projectIndex}
		<ProjectTile
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
	{/each}
</ul>
