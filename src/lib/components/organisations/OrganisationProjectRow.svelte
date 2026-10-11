<script lang="ts">
	import ProjectStatusBadge from '$lib/components/projects/ProjectStatusBadge.svelte';
	import type { ReachableOrganisationProject } from '$lib/server/organisations/markReachableProjects';

	let { project, underLine }: { project: ReachableOrganisationProject; underLine: string } = $props();

	const notOnProjectNote = 'You are not on this project';
</script>

<li class="flex items-center justify-between gap-3 px-4 py-2.5">
	<span class="flex min-w-0 flex-col">
		{#if project.isReachable}
			<a href={`/projects/${project.id}`} class="truncate font-display text-sm transition hover:text-go">
				{project.name}
			</a>
		{:else}
			<span class="truncate font-display text-sm text-chalk/60">{project.name}</span>
		{/if}
		{#if underLine !== ''}
			<span class="truncate text-xs text-chalk/50">{underLine}</span>
		{/if}
		{#if !project.isReachable}
			<span class="truncate text-xs text-chalk/40">{notOnProjectNote}</span>
		{/if}
	</span>
	<ProjectStatusBadge status={project.status} />
</li>
