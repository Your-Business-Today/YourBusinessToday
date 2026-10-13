<script lang="ts">
	import CoverAlbum from './CoverAlbum.svelte';
	import McpEntryCover from './McpEntryCover.svelte';
	import McpEntryDetails from './McpEntryDetails.svelte';
	import SectionCrates from './SectionCrates.svelte';
	import { entriesInCrate, indexOfEntry, mcpCratesOf } from './mcpMapSections';
	import { everySection } from './siteMapSections';
	import { mcpEntriesOf } from '$lib/data/blueprint/mcpEntries';
	import { untrack } from 'svelte';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { McpMap } from '$lib/data/blueprint/mcpMap';
	import type { SiteMap } from '$lib/data/blueprint/siteMap';

	let {
		mcpMap,
		siteMap,
		projectId,
		goals,
		linkedEntryName
	}: { mcpMap: McpMap; siteMap: SiteMap | null; projectId: string; goals: Goal[]; linkedEntryName: string | null } =
		$props();

	const everyEntry = $derived(mcpEntriesOf(mcpMap));

	let chosenSection = $state(everySection);
	let chosenIndex = $state(untrack(() => indexOfEntry(mcpEntriesOf(mcpMap), linkedEntryName)));

	const entries = $derived(entriesInCrate(everyEntry, chosenSection));
	const chosenEntry = $derived(entries[chosenIndex]);

	function chooseSection(section: string) {
		chosenSection = section;
		chosenIndex = 0;
	}
</script>

<SectionCrates
	crates={mcpCratesOf(everyEntry)}
	everyLabel="Everything a Claude can do"
	label="Workflows, skills and agents"
	bind:chosenSection={() => chosenSection, chooseSection}
/>
<CoverAlbum items={entries} keyOf={(entry) => entry.key} label="Connector tools, skills and agents" bind:chosenIndex>
	{#snippet cover(entry, placement, isChosen, onChoose)}
		<McpEntryCover {entry} {placement} {isChosen} {onChoose} />
	{/snippet}
</CoverAlbum>
{#if chosenEntry !== undefined}
	<McpEntryDetails entry={chosenEntry} {siteMap} {projectId} {goals} />
{/if}
