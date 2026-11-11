<script lang="ts">
	import { page } from '$app/state';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { currentProjectPage, projectPageLinks } from './projectPages';
	import type { Project } from '$lib/server/projects/projectRecord';
	import type { Snippet } from 'svelte';

	let {
		project,
		isInternalProject = false,
		badges,
		actions,
		children
	}: { project: Project; isInternalProject?: boolean; badges?: Snippet; actions?: Snippet; children?: Snippet } = $props();

	const { url } = $derived(page);
	const pageLinks = $derived(projectPageLinks(project.id, isInternalProject));
	const hasOtherPages = $derived(pageLinks.length > 1);
	const pageTabs = $derived(pageLinks.map(({ href, label }) => ({ key: href, label, count: null, href })));
	const selectedKey = $derived(currentProjectPage(project.id, url.pathname)?.href ?? '');
</script>

{#snippet pageTabStrip()}
	<TabStrip tabs={pageTabs} {selectedKey} />
{/snippet}

<WorkspaceHeader crumbs={[]} title={project.name} {actions} tabs={hasOtherPages ? pageTabStrip : undefined}>
	{#snippet badge()}
		<ProjectStatusBadge status={project.status} />
		{@render badges?.()}
	{/snippet}
	{@render children?.()}
</WorkspaceHeader>
