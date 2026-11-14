<script lang="ts">
	import StoryboardFilmWordsStage from '$lib/components/brand/film/StoryboardFilmWordsStage.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<StoryboardFilmWordsStage film={data.film} shape={data.shape} />
