<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DeployHistoryEntry from '$lib/components/projects/DeployHistoryEntry.svelte';
	import DeployHistoryFilterBar from '$lib/components/projects/DeployHistoryFilterBar.svelte';
	import ProjectPagination from '$lib/components/projects/ProjectPagination.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { deployPageCount, deploysOnPage, everyDeploy, filterDeploys } from '$lib/data/deployHistoryFilter';
	import { panelEmptyClasses, panelListClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { projectCrumbs } from '$lib/components/workspace/projectCrumbs';

	let { data } = $props();

	let filter = $state({ ...everyDeploy });
	let pageNumber = $state(1);

	const project = $derived(data.project);
	const found = $derived(filterDeploys(data.deploys, filter));
	const pageCount = $derived(deployPageCount(found));
	const shownPage = $derived(Math.min(pageNumber, pageCount));
	const shown = $derived(deploysOnPage(found, shownPage));

	function startFromFirstPage() {
		pageNumber = 1;
	}
</script>

<svelte:head>
	<title>Deployment history — {project.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={projectCrumbs(project)} title={`${project.name} deployment history`} />

<div class={workspaceBodyClasses}>
	<DashboardPanel title="Deploys" count={found.length}>
		{#snippet toolbar()}
			<DeployHistoryFilterBar bind:filter onchange={startFromFirstPage} />
		{/snippet}
		{#if shown.length === 0}
			<p class={panelEmptyClasses}>No deploy carried a task that matches.</p>
		{:else}
			<ul class={panelListClasses}>
				{#each shown as deploy (deploy.liveAt)}
					<DeployHistoryEntry {deploy} />
				{/each}
			</ul>
		{/if}
	</DashboardPanel>
	<ProjectPagination bind:pageNumber {pageCount} />
</div>
