<script lang="ts">
	import DeployNowButton from '$lib/components/projects/DeployNowButton.svelte';
	import DevelopmentTabs from '$lib/components/projects/DevelopmentTabs.svelte';
	import { developmentPages } from '$lib/components/projects/developmentPages';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import StagedTasksPanel from '$lib/components/projects/StagedTasksPanel.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data, form } = $props();

	const { project, stagedTasks, deliveryFacts } = $derived(data);
	const hasRepository = $derived(project.repositoryUrl !== '');
</script>

<svelte:head>
	<title>Staged — {project.name} — Your Business Today</title>
</svelte:head>

{#snippet deployNow()}
	<DeployNowButton defaultBranch={project.defaultBranch} />
{/snippet}

<ProjectPageHeader {project} />

<div class={workspaceBodyClasses}>
	<DevelopmentTabs projectId={project.id} selected={developmentPages.staged} counts={data.developmentTabCounts} />
	<FlashMessage message={form?.message} />
	<StagedTasksPanel {stagedTasks} {deliveryFacts} actions={hasRepository ? deployNow : undefined} />
</div>
