<script lang="ts">
	import BlueprintHeader from '$lib/components/blueprint/BlueprintHeader.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import ScreenAlbum from '$lib/components/blueprint/ScreenAlbum.svelte';
	import ScreenDetails from '$lib/components/blueprint/ScreenDetails.svelte';
	import SectionCrates from '$lib/components/blueprint/SectionCrates.svelte';
	import { blueprintEmptyMessages } from '$lib/components/blueprint/blueprintEmptyMessages';
	import { blueprintQueryKeys, linkedValueOf } from '$lib/components/blueprint/blueprintViews';
	import { cratesOf, everySection, indexOfRoute, screensInCrate } from '$lib/components/blueprint/siteMapSections';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data, form } = $props();

	const { project, blueprint, goals } = $derived(data);
	const siteMap = $derived(blueprint?.siteMap ?? null);

	let chosenSection = $state(everySection);
	let chosenIndex = $state(untrack(() => indexOfRoute(siteMap?.screens ?? [], linkedRoute())));

	const screens = $derived(siteMap === null ? [] : screensInCrate(siteMap, chosenSection));
	const chosenScreen = $derived(screens[chosenIndex]);
	const emptyMessage = $derived(
		project.repositoryUrl === '' ? blueprintEmptyMessages.noRepository : blueprintEmptyMessages.noSiteMap
	);

	function linkedRoute(): string | null {
		return linkedValueOf(page.url, blueprintQueryKeys.screen);
	}

	function chooseSection(section: string) {
		chosenSection = section;
		chosenIndex = 0;
	}
</script>

<svelte:head>
	<title>Site map — {project.name} — Your Business Today</title>
</svelte:head>

<BlueprintHeader {project} {blueprint} viewKey="site-map" title={`${project.name} site map`} />

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	{#if siteMap === null}
		<EmptyState message={emptyMessage} />
	{:else}
		<SectionCrates
			crates={cratesOf(siteMap)}
			bind:chosenSection={() => chosenSection, chooseSection}
		/>
		<ScreenAlbum {screens} bind:chosenIndex />
		{#if chosenScreen !== undefined}
			<ScreenDetails screen={chosenScreen} projectId={project.id} {goals} />
		{/if}
	{/if}
</div>
