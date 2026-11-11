<script lang="ts">
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
	<StagedTasksPanel {stagedTasks} {deliveryFacts} />
</div>
