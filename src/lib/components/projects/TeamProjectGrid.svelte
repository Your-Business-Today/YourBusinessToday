<script lang="ts">
	import TeamProjectTile from './TeamProjectTile.svelte';
	import { ListReorder } from '$lib/client/listReorder.svelte';
	import { postListReorder } from '$lib/client/postListReorder';
	import { projectTileGridClasses } from './projectTileStyles';
	import type { TeamProject } from '$lib/server/members/getTeamProjects';

	let {
		projects,
		onSetPriority
	}: { projects: TeamProject[]; onSetPriority: (project: TeamProject) => void } = $props();

	const listReorder = new ListReorder((movedProjectId, targetProjectId, placement) =>
		postListReorder('?/placeProject', { movedProjectId, targetProjectId, placement })
	);
</script>

<ul class={projectTileGridClasses}>
	{#each projects as project, projectIndex (project.id)}
		<TeamProjectTile
			{project}
			{listReorder}
			isFirst={projectIndex === 0}
			isLast={projectIndex === projects.length - 1}
			{onSetPriority}
		/>
	{/each}
</ul>
