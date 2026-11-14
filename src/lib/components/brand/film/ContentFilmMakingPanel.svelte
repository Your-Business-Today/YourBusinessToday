<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { filmMakingPageWords, filmStandingOnPage } from '$lib/brand/film/filmMakingPageWords';
	import { FilmMakingStates, isFilmMakingOpen, type FilmMaking, type FilmMakingKind } from '$lib/brand/film/filmMaking';

	let {
		kind,
		making,
		libraryPath,
		answer
	}: { kind: FilmMakingKind; making: FilmMaking | null; libraryPath: string; answer: string | null } = $props();

	const words = $derived(filmMakingPageWords[kind]);
	const isOpen = $derived(isFilmMakingOpen(making));
	const isReady = $derived(making?.state === FilmMakingStates.ready);
	const tracker = new FormTracker();
</script>

<DashboardPanel title={words.title} isPadded>
	<div class="flex flex-col gap-3 text-sm">
		{#if making === null}
			<p class="text-chalk-muted">{words.explained}</p>
		{/if}
		{#if making !== null}
			<p class="text-chalk">{filmStandingOnPage(making)}</p>
		{/if}
		{#if isReady}
			<a href={libraryPath} class="text-go hover:underline">See it in the library</a>
		{/if}
		{#if answer !== null}
			<p role="status" class="text-chalk">{answer}</p>
		{/if}
		<form method="POST" action="?/make" use:enhance={tracker.submit()} class="flex justify-end">
			<input type="hidden" name="kind" value={kind} />
			<Button type="submit" look="primary" disabled={isOpen} isSaving={tracker.isSaving}>{words.button}</Button>
		</form>
	</div>
</DashboardPanel>
