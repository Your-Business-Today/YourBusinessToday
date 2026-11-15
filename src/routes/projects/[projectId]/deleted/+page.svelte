<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DeletedTaskEntry from '$lib/components/projects/DeletedTaskEntry.svelte';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import { panelEmptyClasses, panelListClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const project = $derived(data.project);
	const deletedTasks = $derived(data.deletedTasks);
</script>

<svelte:head>
	<title>Deleted tasks — {project.name} — Your Business Today</title>
</svelte:head>

<ProjectPageHeader {project} />

<div class={workspaceBodyClasses}>
	<DashboardPanel title="Deleted tasks" count={deletedTasks.length}>
		{#if deletedTasks.length === 0}
			<p class={panelEmptyClasses}>No task has been deleted from this project.</p>
		{:else}
			<ul class={panelListClasses}>
				{#each deletedTasks as deletedTask (deletedTask.deletionId)}
					<DeletedTaskEntry {deletedTask} />
				{/each}
			</ul>
		{/if}
	</DashboardPanel>
</div>
