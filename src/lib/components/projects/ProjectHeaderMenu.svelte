<script lang="ts">
	import ActionsMenu, { menuItemClasses } from '$lib/components/site/ActionsMenu.svelte';
	import DeployNowButton from './DeployNowButton.svelte';
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
		<DeployNowButton defaultBranch={project.defaultBranch} isMenuItem />
	{/if}
</ActionsMenu>
