<script lang="ts">
	import DevelopmentTabs from '$lib/components/projects/DevelopmentTabs.svelte';
	import { developmentPages } from '$lib/components/projects/developmentPages';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DeployHistoryEntry from '$lib/components/projects/DeployHistoryEntry.svelte';
	import DeployHistoryFilterBar from '$lib/components/projects/DeployHistoryFilterBar.svelte';
	import ProjectPagination from '$lib/components/projects/ProjectPagination.svelte';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import { deployPageCount, deploysOnPage, everyDeploy, filterDeploys } from '$lib/data/deployHistoryFilter';
	import { panelEmptyClasses, panelListClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

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
	<title>Deployments — {project.name} — Your Business Today</title>
</svelte:head>

<ProjectPageHeader {project} />

<div class={workspaceBodyClasses}>
	<DevelopmentTabs projectId={project.id} selected={developmentPages.deploys} counts={data.developmentTabCounts} />
	<DashboardPanel title="Deployments" count={found.length}>
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
