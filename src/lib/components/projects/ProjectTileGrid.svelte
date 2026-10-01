<script lang="ts">
	import ProjectTile from './ProjectTile.svelte';
	import { ListReorder } from '$lib/client/listReorder.svelte';
	import { postListReorder } from '$lib/client/postListReorder';
	import { projectTileGridClasses } from './projectTileStyles';
	import type { ProjectSummary } from '$lib/server/projects/getProjectList';

	let {
		projects,
		latestKitVersion,
		firstPositionNumber,
		projectCount,
		onEdit,
		onDelete,
		onSetPriority
	}: {
		projects: ProjectSummary[];
		latestKitVersion: string;
		firstPositionNumber: number;
		projectCount: number;
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
		<ProjectTile
			{project}
			{latestKitVersion}
			{listReorder}
			isFirst={firstPositionNumber + projectIndex === 1}
			isLast={firstPositionNumber + projectIndex === projectCount}
			{onEdit}
			{onDelete}
			{onSetPriority}
		/>
	{/each}
</ul>
