<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { filmMakingExplained, filmStandingOnPage } from '$lib/brand/film/filmMakingPageWords';
	import { FilmMakingStates, isFilmMakingOpen, type FilmMaking } from '$lib/brand/film/filmMaking';

	let { making, libraryPath, answer }: { making: FilmMaking | null; libraryPath: string; answer: string | null } = $props();

	const isOpen = $derived(isFilmMakingOpen(making));
	const isReady = $derived(making?.state === FilmMakingStates.ready);
	const tracker = new FormTracker();
</script>

<DashboardPanel title="The video" isPadded>
	<div class="flex flex-col gap-3 text-sm">
		{#if making === null}
			<p class="text-chalk-muted">{filmMakingExplained}</p>
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
		<form method="POST" action="?/makeVideo" use:enhance={tracker.submit()} class="flex justify-end">
			<Button type="submit" look="primary" disabled={isOpen} isSaving={tracker.isSaving}>Make the video</Button>
		</form>
	</div>
</DashboardPanel>
