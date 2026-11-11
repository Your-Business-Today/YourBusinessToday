<script lang="ts">
	import { page } from '$app/state';
	import ProjectBar from '$lib/components/projects/ProjectBar.svelte';

	let { children } = $props();

	const { url, params, data } = $derived(page);
	const { project, framePicks } = $derived(data);
	const projectName = $derived<string | null>(project?.name ?? null);
</script>

<ProjectBar
	projectId={params.projectId ?? ''}
	{projectName}
	projects={framePicks?.projects ?? []}
	pathname={url.pathname}
/>
{@render children()}
