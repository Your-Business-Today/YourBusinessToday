<script lang="ts">
	import { isMusic, isVideo } from '$lib/brand/library/libraryItem';
	import type { LibraryPageItem } from './brandLibraryPageWords';

	let { item }: { item: Pick<LibraryPageItem, 'viewUrl' | 'filename' | 'mimeType' | 'shows'> } = $props();

	const frameClasses = 'h-16 w-24 object-cover';
</script>

{#if item.viewUrl === null}
	<span class="text-xs text-chalk-faint">{item.filename}</span>
{:else if isMusic(item)}
	<audio src={item.viewUrl} preload="metadata" controls class="w-48" aria-label={`Play ${item.filename}`}></audio>
{:else if isVideo(item)}
	<a href={item.viewUrl} target="_blank" rel="noopener" aria-label={`Play ${item.filename}`}>
		<video src={item.viewUrl} preload="metadata" muted class={frameClasses}></video>
	</a>
{:else}
	<a href={item.viewUrl} target="_blank" rel="noopener">
		<img src={item.viewUrl} alt={item.shows} loading="lazy" class={frameClasses} />
	</a>
{/if}
