<script lang="ts">
	import LibraryPreview from './LibraryPreview.svelte';
	import { PictureStandings } from '$lib/brand/pictures/postPictures';
	import { noLongerPostableExplained, noPictureNeedSaid } from './postPictureWords';
	import type { PostPicturesPage } from '$lib/brand/projections/postPicturesPage';

	let { pictures }: { pictures: PostPicturesPage } = $props();

	const isNoLongerPostable = $derived(pictures.standing === PictureStandings.noLongerPostable);
	const isWaiting = $derived(pictures.standing === PictureStandings.waiting);
</script>

<div class="flex flex-col gap-2 text-sm">
	{#each pictures.chosen as item (item.id)}
		<LibraryPreview {item} />
	{/each}
	{#if isNoLongerPostable}
		<span class="text-signal">{noLongerPostableExplained}</span>
	{/if}
	{#if isWaiting}
		<span class="text-chalk">Waiting on a picture: {pictures.needed}</span>
		{#if pictures.expectedFrom !== null}
			<span class="text-chalk-muted">Expected from {pictures.expectedFrom}</span>
		{/if}
	{/if}
	{#if pictures.standing === PictureStandings.noneSaid}
		<span class="text-chalk-subtle">{noPictureNeedSaid}</span>
	{/if}
</div>
