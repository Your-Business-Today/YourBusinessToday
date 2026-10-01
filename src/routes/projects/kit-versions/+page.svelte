<script lang="ts">
	import { enhance } from '$app/forms';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import KitVersionRow from '$lib/components/projects/KitVersionRow.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import {
		headerPrimaryButtonClasses,
		panelEmptyClasses,
		panelListClasses,
		workspaceBodyClasses
	} from '$lib/components/workspace/workspaceStyles';
	import { projectsCrumb } from '$lib/components/workspace/projectCrumbs';

	let { data, form } = $props();

	let isReading = $state(false);

	const register = $derived(data.register);
	const behindCount = $derived(register.entries.filter((entry) => entry.standing === 'behind').length);
	const currentCount = $derived(register.entries.filter((entry) => entry.standing === 'current').length);
	const summaryLine = $derived(
		register.latestKitVersion === ''
			? 'The latest kit version has not been read yet — read the versions now.'
			: `${currentCount} of ${register.entries.length} repositories on the latest kit ${register.latestKitVersion}; ${behindCount} behind.`
	);
</script>

<svelte:head>
	<title>Kit versions — Projects — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[projectsCrumb]} title="Kit versions">
	{#snippet actions()}
		<form
			method="POST"
			action="?/readKitVersions"
			use:enhance={() => {
				isReading = true;
				return async ({ update }) => {
					await update();
					isReading = false;
				};
			}}
		>
			<button type="submit" disabled={isReading} class={headerPrimaryButtonClasses}>
				{isReading ? 'Reading…' : 'Read versions now'}
			</button>
		</form>
	{/snippet}
	<p class="text-sm text-chalk/60">
		The project-process version each repository is on. Every push to a repository's default branch
		reads it again, and a push to project-process reads the latest.
	</p>
	<p class="text-sm text-chalk/80">{summaryLine}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<DashboardPanel title="Repositories" count={register.entries.length}>
		{#if register.entries.length === 0}
			<p class={panelEmptyClasses}>No project of yours has a repository recorded yet.</p>
		{:else}
			<ul class={panelListClasses}>
				{#each register.entries as entry (entry.projectId)}
					<KitVersionRow {entry} latestKitVersion={register.latestKitVersion} />
				{/each}
			</ul>
		{/if}
	</DashboardPanel>
	{#if register.projectsWithoutRepository > 0}
		<p class="text-xs text-chalk/50">
			{register.projectsWithoutRepository} more projects have no repository recorded, so they carry no kit.
		</p>
	{/if}
</div>
