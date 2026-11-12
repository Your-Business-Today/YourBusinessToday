<script lang="ts">
	import ActionsMenu, { menuItemClasses } from '$lib/components/site/ActionsMenu.svelte';
	import type { Project } from '$lib/server/projects/projectRecord';

	let { project, onEdit }: { project: Project; onEdit: () => void } = $props();

	let isOpen = $state(false);

	function chooseEdit() {
		isOpen = false;
		onEdit();
	}
</script>

<ActionsMenu subjectName={project.name} menuWidthClass="w-48" bind:isOpen>
	<button type="button" role="menuitem" onclick={chooseEdit} class={menuItemClasses}>Edit…</button>
</ActionsMenu>
