<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import LibraryPreview from './LibraryPreview.svelte';
	import { PictureStandings } from '$lib/brand/pictures/postPictures';
	import { postingBadgeOf } from './brandLibraryPageWords';
	import { postingReasonOf } from '$lib/brand/library/libraryWords';
	import { noLongerPostableExplained, noPictureNeedSaid, pictureBadgeOf } from './postPictureWords';
	import type { PostPicturesPage } from '$lib/brand/projections/postPicturesPage';

	let { pictures }: { pictures: PostPicturesPage } = $props();

	const badge = $derived(pictureBadgeOf(pictures.standing, pictures.chosenCount));
	const isNoLongerPostable = $derived(pictures.standing === PictureStandings.noLongerPostable);
</script>

<div class="flex flex-col gap-4">
	{#if badge !== null}
		<Badge {...badge} hasDot />
	{/if}
	<dl class="flex flex-col gap-3">
		<div class="flex flex-col gap-1">
			<dt class="text-sm font-semibold text-chalk">Needs</dt>
			<dd class="whitespace-pre-line break-words text-chalk-muted">{pictures.needed ?? noPictureNeedSaid}</dd>
		</div>
		{#if pictures.expectedFrom !== null}
			<div class="flex flex-col gap-1">
				<dt class="text-sm font-semibold text-chalk">Expected from</dt>
				<dd class="break-words text-chalk-muted">{pictures.expectedFrom}</dd>
			</div>
		{/if}
	</dl>
	{#if isNoLongerPostable}
		<p role="status" class="text-sm text-signal">{noLongerPostableExplained}</p>
	{/if}
	<ul class="flex flex-col gap-3">
		{#each pictures.chosen as item (item.id)}
			<li class="flex items-start gap-3">
				<LibraryPreview {item} />
				<div class="flex min-w-0 flex-col gap-1 text-sm">
					<span class="break-words text-chalk">{item.shows}</span>
					<Badge {...postingBadgeOf(item)} />
					<span class="text-xs text-chalk-faint">{postingReasonOf(item)}</span>
				</div>
			</li>
		{/each}
	</ul>
</div>
