<script lang="ts">
	import DevelopmentTabs from '$lib/components/projects/DevelopmentTabs.svelte';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import ProjectPeoplePanel from '$lib/components/members/ProjectPeoplePanel.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import { developmentPages } from '$lib/components/projects/developmentPages';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data, form } = $props();

	const { project, people, isOwner } = $derived(data);
</script>

<svelte:head>
	<title>People — {project.name} — Your Business Today</title>
</svelte:head>

<ProjectPageHeader {project} />

<div class={workspaceBodyClasses}>
	<DevelopmentTabs projectId={project.id} selected={developmentPages.people} counts={data.developmentTabCounts} />
	<FlashMessage message={form?.message} />
	<ProjectPeoplePanel {people} {isOwner} />
</div>
