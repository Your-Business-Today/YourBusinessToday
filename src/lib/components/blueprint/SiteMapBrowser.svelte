<script lang="ts">
	import CoverAlbum from './CoverAlbum.svelte';
	import ScreenCover from './ScreenCover.svelte';
	import ScreenDetails from './ScreenDetails.svelte';
	import SectionCrates from './SectionCrates.svelte';
	import { cratesOf, everySection, indexOfRoute, screensInCrate } from './siteMapSections';
	import { untrack } from 'svelte';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { McpMap } from '$lib/data/blueprint/mcpMap';
	import type { SiteMap } from '$lib/data/blueprint/siteMap';

	let {
		siteMap,
		mcpMap,
		projectId,
		goals,
		linkedRoute
	}: { siteMap: SiteMap; mcpMap: McpMap | null; projectId: string; goals: Goal[]; linkedRoute: string | null } = $props();

	let chosenSection = $state(everySection);
	let chosenIndex = $state(untrack(() => indexOfRoute(siteMap.screens, linkedRoute)));

	const screens = $derived(screensInCrate(siteMap, chosenSection));
	const chosenScreen = $derived(screens[chosenIndex]);

	function chooseSection(section: string) {
		chosenSection = section;
		chosenIndex = 0;
	}
</script>

<SectionCrates
	crates={cratesOf(siteMap)}
	everyLabel="Every screen"
	label="Sections of the site"
	bind:chosenSection={() => chosenSection, chooseSection}
/>
<CoverAlbum items={screens} keyOf={(screen) => screen.route} label="Screens" bind:chosenIndex>
	{#snippet cover(screen, placement, isChosen, onChoose)}
		<ScreenCover {screen} {placement} {isChosen} {onChoose} />
	{/snippet}
</CoverAlbum>
{#if chosenScreen !== undefined}
	<ScreenDetails screen={chosenScreen} {mcpMap} {projectId} {goals} />
{/if}
