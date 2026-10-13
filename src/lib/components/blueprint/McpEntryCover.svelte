<script lang="ts">
	import CoverSleeve from './CoverSleeve.svelte';
	import McpEntryFace from './McpEntryFace.svelte';
	import type { CoverPlacement } from '$lib/data/blueprint/albumPlacement';
	import type { McpEntry } from '$lib/data/blueprint/mcpEntries';

	let {
		entry,
		placement,
		isChosen,
		onChoose
	}: { entry: McpEntry; placement: CoverPlacement; isChosen: boolean; onChoose: () => void } = $props();
</script>

<CoverSleeve label={entry.name} caption={entry.name} subcaption={entry.section} {placement} {isChosen} {onChoose}>
	<McpEntryFace {entry} />
</CoverSleeve>
