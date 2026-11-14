<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { filmMakingPageWords, filmStandingOnPage } from '$lib/brand/film/filmMakingPageWords';
	import { FilmMakingStates, type FilmMaking, type FilmMakingKind } from '$lib/brand/film/filmMaking';

	let { kind, making, libraryPath }: { kind: FilmMakingKind; making: FilmMaking | null; libraryPath: string } = $props();

	const words = $derived(filmMakingPageWords[kind]);
	const isReady = $derived(making?.state === FilmMakingStates.ready);
</script>

<DashboardPanel title={words.title} isPadded>
	<div class="flex flex-col gap-3 text-sm">
		<p class="text-chalk-muted">{words.explained}</p>
		{#if making !== null}
			<p class="text-chalk">{filmStandingOnPage(making)}</p>
		{/if}
		{#if isReady}
			<a href={libraryPath} class="text-go hover:underline">See it in the library</a>
		{/if}
		<p class="text-chalk-muted">{words.howToAsk}</p>
	</div>
</DashboardPanel>
