<script lang="ts">
	import { isVideo } from '$lib/brand/library/libraryItem';
	import type { LibraryPageItem } from './brandLibraryPageWords';

	let { item }: { item: LibraryPageItem } = $props();

	const frameClasses = 'h-16 w-24 object-cover';
</script>

{#if item.viewUrl === null}
	<span class="text-xs text-chalk-faint">{item.filename}</span>
{:else if isVideo(item)}
	<a href={item.viewUrl} target="_blank" rel="noopener" aria-label={`Play ${item.filename}`}>
		<video src={item.viewUrl} preload="metadata" muted class={frameClasses}></video>
	</a>
{:else}
	<a href={item.viewUrl} target="_blank" rel="noopener">
		<img src={item.viewUrl} alt={item.shows} loading="lazy" class={frameClasses} />
	</a>
{/if}
