<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import LibraryMatchRow from './LibraryMatchRow.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { LibrarySearch } from '$lib/projectLibrary/libraryMatch';

	let { search }: { search: LibrarySearch } = $props();

	const { words, matches, refusal } = $derived(search);
</script>

<DashboardPanel title={`Videos and documents matching “${words}”`} count={matches.length}>
	{#if refusal !== null}
		<p class={panelEmptyClasses}>Not searched: {refusal}.</p>
	{:else if matches.length === 0}
		<p class={panelEmptyClasses}>Nothing matches. Try fewer words, or other words for the same thing.</p>
	{:else}
		<ul class={panelListClasses}>
			{#each matches as match (match.id)}
				<LibraryMatchRow {match} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
