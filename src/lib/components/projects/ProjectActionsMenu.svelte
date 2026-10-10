<script lang="ts">
	import ActionsMenu from '$lib/components/site/ActionsMenu.svelte';

	let {
		projectName,
		onEdit,
		onDelete
	}: { projectName: string; onEdit: () => void; onDelete: () => void } = $props();

	let isOpen = $state(false);

	function choose(menuAction: () => void) {
		isOpen = false;
		menuAction();
	}
</script>

<ActionsMenu subjectName={projectName} menuWidthClass="w-44" bind:isOpen>
	<button
		type="button"
		onclick={() => choose(onEdit)}
		class="w-full rounded-xl px-3 py-2 text-left font-display text-sm text-chalk/80
			transition hover:bg-hairline/40 hover:text-chalk"
	>
		Edit…
	</button>
	<button
		type="button"
		onclick={() => choose(onDelete)}
		class="w-full rounded-xl px-3 py-2 text-left font-display text-sm text-signal/90
			transition hover:bg-signal/10 hover:text-signal"
	>
		Delete…
	</button>
</ActionsMenu>
