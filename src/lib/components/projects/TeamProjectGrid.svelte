<script lang="ts">
	import TeamProjectTile from './TeamProjectTile.svelte';
	import { projectTileGridClasses } from './projectTileStyles';
	import type { TeamProject } from '$lib/server/members/getTeamProjects';

	let {
		projects,
		onSetPriority
	}: { projects: TeamProject[]; onSetPriority: (project: TeamProject) => void } = $props();
</script>

<ul class={projectTileGridClasses}>
	{#each projects as project, projectIndex (project.id)}
		<TeamProjectTile
			{project}
			isFirst={projectIndex === 0}
			isLast={projectIndex === projects.length - 1}
			{onSetPriority}
		/>
	{/each}
</ul>
