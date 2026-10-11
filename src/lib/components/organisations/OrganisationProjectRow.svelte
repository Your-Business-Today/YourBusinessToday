<script lang="ts">
	import ProjectStatusBadge from '$lib/components/projects/ProjectStatusBadge.svelte';
	import type { OrganisationProject } from '$lib/server/organisations/getProjectsForOrganisation';

	let { project, underLine }: { project: OrganisationProject; underLine: string } = $props();
</script>

<li class="flex items-center justify-between gap-3 px-4 py-2.5">
	<span class="flex min-w-0 flex-col">
		<a href={`/projects/${project.id}`} class="truncate font-display text-sm transition hover:text-go">
			{project.name}
		</a>
		{#if underLine !== ''}
			<span class="truncate text-xs text-chalk/50">{underLine}</span>
		{/if}
	</span>
	<ProjectStatusBadge status={project.status} />
</li>
