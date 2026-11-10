<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import { pictureBadgeOf, pictureNotSaid } from './postPictureWords';
	import type { PictureSummary } from '$lib/brand/pictures/postPictures';

	let { picture }: { picture: PictureSummary } = $props();

	const badge = $derived(pictureBadgeOf(picture.standing, picture.chosenCount));
</script>

{#if badge === null}
	<span class="text-chalk-subtle">{pictureNotSaid}</span>
{:else}
	<span title={picture.needed ?? undefined}><Badge {...badge} hasDot /></span>
{/if}
