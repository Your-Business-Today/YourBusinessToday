<script lang="ts">
	import AutocompleteProjectPanel from '$lib/components/autocomplete/AutocompleteProjectPanel.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { projectsCrumb } from '$lib/components/workspace/projectCrumbs';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { register } = $derived(data);
</script>

<svelte:head>
	<title>Autocomplete register — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[projectsCrumb]} title="Autocomplete register">
	<p class="text-sm text-chalk/60">
		What an AI running on a schedule may take through to a merged pull request without asking. Every
		goal starts on; a task follows its goal unless it has its own setting.
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	{#if register.length === 0}
		<EmptyState message="You are on no projects yet." />
	{:else}
		{#each register as project (project.id)}
			<AutocompleteProjectPanel {project} />
		{/each}
	{/if}
</div>
