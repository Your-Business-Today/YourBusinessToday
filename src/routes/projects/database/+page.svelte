<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DatabaseTaskRow from '$lib/components/projects/DatabaseTaskRow.svelte';
	import DatabaseTaskRunRow from '$lib/components/projects/DatabaseTaskRunRow.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { panelEmptyClasses, panelListClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { projectsCrumb } from '$lib/components/workspace/projectCrumbs';

	let { data, form } = $props();

	const { register } = $derived(data);
	const pending = $derived(register.pending);
	const recentlyRun = $derived(register.recentlyRun);
	const pendingCount = $derived(pending.length);
	const summaryLine = $derived(
		pendingCount === 0
			? 'Every migration that has merged has been run.'
			: `${pendingCount} ${pendingCount === 1 ? 'migration waits' : 'migrations wait'} to be run — oldest first, so they go in order.`
	);
</script>

<svelte:head>
	<title>Database tasks — Projects — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[projectsCrumb]} title="Database tasks">
	<p class="text-sm text-chalk/60">
		Every migration file a merged pull request brought to a project's default branch, with what to run
		it with. Run it, then confirm it here or through the connector — a migration that is not run is
		one cause of site errors.
	</p>
	<p class="text-sm text-chalk/80">{summaryLine}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<DashboardPanel title="To run" count={pendingCount}>
		{#if pendingCount === 0}
			<p class={panelEmptyClasses}>Nothing waits. The next merge that adds a migration lands here.</p>
		{:else}
			<ul class={panelListClasses}>
				{#each pending as task (task.id)}
					<DatabaseTaskRow {task} />
				{/each}
			</ul>
		{/if}
	</DashboardPanel>
	<DashboardPanel title="Run lately" count={recentlyRun.length}>
		{#if recentlyRun.length === 0}
			<p class={panelEmptyClasses}>No migration has been confirmed as run yet.</p>
		{:else}
			<ul class={panelListClasses}>
				{#each recentlyRun as task (task.id)}
					<DatabaseTaskRunRow {task} runnerName={data.runnerNames[task.runByAccountId ?? ''] ?? ''} />
				{/each}
			</ul>
		{/if}
	</DashboardPanel>
</div>
