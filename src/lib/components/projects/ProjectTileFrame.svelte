<script lang="ts">
	import ReorderableRow from '$lib/components/site/ReorderableRow.svelte';
	import { projectTileClasses } from './projectTileStyles';
	import type { ListReorder } from '$lib/client/listReorder.svelte';
	import type { Snippet } from 'svelte';

	let {
		listReorder,
		projectId,
		projectName,
		content
	}: {
		listReorder: ListReorder;
		projectId: string;
		projectName: string;
		content: Snippet<[Snippet]>;
	} = $props();
</script>

<ReorderableRow {listReorder} rowId={projectId} class={projectTileClasses}>
	{#snippet children(dragHandle)}
		<a href={`/projects/${projectId}`} class="absolute inset-0 rounded-xl">
			<span class="sr-only">Open {projectName}</span>
		</a>
		{@render content(dragHandle)}
	{/snippet}
</ReorderableRow>
