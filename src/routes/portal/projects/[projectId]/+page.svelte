<script lang="ts">
	import HeaderFacts from '$lib/components/workspace/HeaderFacts.svelte';
	import PortalRequestForm from '$lib/components/portal/PortalRequestForm.svelte';
	import PortalRequestList from '$lib/components/portal/PortalRequestList.svelte';
	import PortalGoalList from '$lib/components/portal/PortalGoalList.svelte';
	import PortalTaskList from '$lib/components/portal/PortalTaskList.svelte';
	import ProjectStatusBadge from '$lib/components/projects/ProjectStatusBadge.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { portalHomePath } from '$lib/portal/portalPaths';

	let { data } = $props();

	const project = $derived(data.project);
	const visitor = $derived(data.visitor);
	const crumbs = $derived([{ label: visitor.organisationName, href: portalHomePath }]);
	const headerFacts = $derived([
		{ label: `${project.completionPercent}% of current work done` },
		...environmentFacts(project.environmentUrl)
	]);

	function environmentFacts(environmentUrl: string) {
		if (environmentUrl === '') return [];
		return [{ label: 'Open your system', href: environmentUrl }];
	}
</script>

<svelte:head>
	<title>{project.name} — Client portal</title>
</svelte:head>

<WorkspaceHeader {crumbs} title={project.name}>
	{#snippet badge()}
		<ProjectStatusBadge status={project.status} />
	{/snippet}
	<HeaderFacts facts={headerFacts} />
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<div class={dashboardGridClasses}>
		<PortalTaskList tasks={project.openTasks} />
		<PortalGoalList goals={project.currentGoals} />
		<PortalRequestForm />
		<PortalRequestList requests={data.requests} />
	</div>
</div>
