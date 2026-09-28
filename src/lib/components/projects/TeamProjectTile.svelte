<script lang="ts">
	import AssignedToYouNote from './AssignedToYouNote.svelte';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';
	import { projectTileClasses } from './projectTileStyles';
	import type { TeamProject } from '$lib/server/members/getTeamProjects';

	let { project }: { project: TeamProject } = $props();

	const openTaskLine = $derived(
		project.openTaskCount === 1 ? '1 open task' : `${project.openTaskCount} open tasks`
	);
</script>

<li class={projectTileClasses}>
	<a href={`/projects/${project.id}`} class="absolute inset-0 rounded-2xl">
		<span class="sr-only">Open {project.name}</span>
	</a>
	<div class="flex items-center justify-between gap-3">
		<span class="font-display text-xs tracking-widest text-chalk/40 uppercase">Team</span>
		<ProjectStatusBadge status={project.status} />
	</div>
	<div class="flex flex-col gap-1">
		<h3 class="font-display text-lg leading-snug font-medium transition group-hover/tile:text-go">
			{project.name}
		</h3>
		<p class="text-sm text-chalk/60">Owned by {project.ownerName}</p>
	</div>
	<div class="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
		<span class="font-display text-xs text-chalk/50">{openTaskLine}</span>
		<AssignedToYouNote assignedTaskCount={project.assignedTaskCount} />
	</div>
</li>
