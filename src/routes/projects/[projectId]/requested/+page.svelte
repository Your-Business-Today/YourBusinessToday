<script lang="ts">
	import DesignRequestsPanel from '$lib/components/projects/DesignRequestsPanel.svelte';
	import DevelopmentTabs from '$lib/components/projects/DevelopmentTabs.svelte';
	import { developmentPages } from '$lib/components/projects/developmentPages';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { project, designRequests } = $derived(data);
</script>

<svelte:head>
	<title>Requested — {project.name} — Your Business Today</title>
</svelte:head>

<ProjectPageHeader {project} />

<div class={workspaceBodyClasses}>
	<DevelopmentTabs projectId={project.id} selected={developmentPages.requested} counts={data.developmentTabCounts} />
	<DesignRequestsPanel {designRequests} />
</div>
