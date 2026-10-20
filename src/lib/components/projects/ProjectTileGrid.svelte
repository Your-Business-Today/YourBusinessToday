<script lang="ts">
	import ProjectTile from './ProjectTile.svelte';
	import { ListReorder } from '$lib/client/listReorder.svelte';
	import { postListReorder } from '$lib/client/postListReorder';
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

	const listReorder = new ListReorder((movedProjectId, targetProjectId, placement) =>
		postListReorder('?/placeProject', { movedProjectId, targetProjectId, placement })
	);
</script>

<ul class={projectTileGridClasses}>
	{#each projects as project, projectIndex (project.id)}
		{@const position = firstPositionNumber + projectIndex}
		<ProjectTile
			{project}
			{latestKitVersion}
			{listReorder}
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
