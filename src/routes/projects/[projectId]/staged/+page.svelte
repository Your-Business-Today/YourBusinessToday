<script lang="ts">
	import DevelopmentTabs from '$lib/components/projects/DevelopmentTabs.svelte';
	import { developmentPages } from '$lib/components/projects/developmentPages';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import StagedTasksPanel from '$lib/components/projects/StagedTasksPanel.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { project, stagedTasks, deliveryFacts } = $derived(data);
</script>

<svelte:head>
	<title>Staged — {project.name} — Your Business Today</title>
</svelte:head>

<ProjectPageHeader {project} />

<div class={workspaceBodyClasses}>
	<DevelopmentTabs projectId={project.id} selected={developmentPages.staged} />
	<StagedTasksPanel {stagedTasks} {deliveryFacts} />
</div>
