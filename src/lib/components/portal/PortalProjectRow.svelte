<script lang="ts">
	import PortalEnvironmentLink from './PortalEnvironmentLink.svelte';
	import PortalGoalRow from './PortalGoalRow.svelte';
	import ProjectStatusBadge from '$lib/components/projects/ProjectStatusBadge.svelte';
	import { portalProjectPath } from '$lib/portal/portalPaths';
	import type { PortalProject } from '$lib/portal/portalProject';

	let { project }: { project: PortalProject } = $props();
</script>

<li class="flex flex-col gap-3 px-4 py-4">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="flex min-w-0 flex-col gap-0.5">
			<a href={portalProjectPath(project.id)} class="truncate font-display transition hover:text-go">
				{project.name}
			</a>
			<PortalEnvironmentLink environmentUrl={project.environmentUrl} />
		</div>
		<div class="flex items-center gap-3">
			<span class="font-display text-xs text-chalk/60 tabular-nums">
				{project.completionPercent}% done
			</span>
			<ProjectStatusBadge status={project.status} />
		</div>
	</div>
	{#each project.currentGoals as goal (goal.id)}
		<PortalGoalRow {goal} />
	{/each}
</li>
