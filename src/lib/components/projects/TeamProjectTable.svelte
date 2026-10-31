<script lang="ts">
	import ProjectTableHeader from './ProjectTableHeader.svelte';
	import TeamProjectRow from './TeamProjectRow.svelte';
	import { projectRowClasses, teamProjectColumns, teamProjectTableClasses } from './projectTableStyles';
	import { flip } from 'svelte/animate';
	import { rowMove } from '$lib/client/motion';
	import { rowLink } from '$lib/client/rowLink';
	import type { TeamProject } from '$lib/server/members/getTeamProjects';

	let {
		projects,
		onSetPriority
	}: { projects: TeamProject[]; onSetPriority: (project: TeamProject) => void } = $props();
</script>

<ul class={teamProjectTableClasses}>
	<ProjectTableHeader columns={teamProjectColumns} />
	{#each projects as project, projectIndex (project.id)}
		<li animate:flip={rowMove} use:rowLink={`/projects/${project.id}`} class={projectRowClasses}>
			<TeamProjectRow
				{project}
				isFirst={projectIndex === 0}
				isLast={projectIndex === projects.length - 1}
				{onSetPriority}
			/>
		</li>
	{/each}
</ul>
