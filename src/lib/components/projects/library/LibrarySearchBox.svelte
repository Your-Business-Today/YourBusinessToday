<script lang="ts">
	import { page } from '$app/state';
	import { LibrarySearchLimits, librarySearchQueryKey, type LibrarySearch } from '$lib/projectLibrary/libraryMatch';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';

	let { search }: { search: LibrarySearch | null } = $props();

	const { url } = $derived(page);
	const inputClasses = 'min-w-0 flex-1 rounded-lg border border-hairline bg-carriage px-3 py-2 text-sm text-chalk outline-none focus:border-go';
</script>

<form method="GET" role="search" class="flex flex-wrap items-center gap-2">
	<input
		type="search"
		name={librarySearchQueryKey}
		value={search?.words ?? ''}
		required
		maxlength={LibrarySearchLimits.longestWords}
		placeholder="Search videos and documents"
		aria-label="Search this project's videos and documents"
		class={inputClasses}
	/>
	<button type="submit" class={panelButtonClasses}>Search</button>
	{#if search !== null}
		<a href={url.pathname} class={panelButtonClasses}>Clear</a>
	{/if}
</form>
