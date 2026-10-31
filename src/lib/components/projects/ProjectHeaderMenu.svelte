<script lang="ts">
	import ActionsMenu, { menuItemClasses } from '$lib/components/site/ActionsMenu.svelte';
	import DeployNowButton from './DeployNowButton.svelte';
	import { blueprintViewHref, blueprintViews } from '$lib/components/blueprint/blueprintViews';
	import type { Project } from '$lib/server/projects/projectRecord';

	let { project, onEdit }: { project: Project; onEdit: () => void } = $props();

	let isOpen = $state(false);

	const hasRepository = $derived(project.repositoryUrl !== '');

	function chooseEdit() {
		isOpen = false;
		onEdit();
	}
</script>

<ActionsMenu subjectName={project.name} menuWidthClass="w-48" bind:isOpen>
	<button type="button" role="menuitem" onclick={chooseEdit} class={menuItemClasses}>Edit…</button>
	{#if hasRepository}
		{#each blueprintViews as view (view.key)}
			<a href={blueprintViewHref(project.id, view.path)} role="menuitem" class={menuItemClasses}>
				{view.label}
			</a>
		{/each}
		<a href={`/projects/${project.id}/deploys`} role="menuitem" class={menuItemClasses}>Deployment history</a>
		<DeployNowButton defaultBranch={project.defaultBranch} isMenuItem />
	{/if}
</ActionsMenu>
