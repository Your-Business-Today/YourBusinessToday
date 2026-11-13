<script lang="ts">
	import CountedFilterChip from '$lib/components/projects/CountedFilterChip.svelte';
	import { teamWorkFilterChips, type FilterSource } from './teamWorkFilterChips';
	import type { TeamWorkFilter } from '$lib/data/teamWorkFilter';

	let { source, filter = $bindable() }: { source: FilterSource; filter: TeamWorkFilter } = $props();

	const groups = $derived(teamWorkFilterChips(source, filter));
</script>

<div class="flex flex-col gap-2">
	{#each groups as group (group.label)}
		<div role="group" aria-label={`Filter by ${group.label.toLowerCase()}`} class="flex flex-wrap items-center gap-2">
			<span class="w-16 shrink-0 text-xs text-chalk-subtle">{group.label}</span>
			{#each group.chips as chip (chip.key)}
				<CountedFilterChip
					label={chip.label}
					title={chip.title}
					count={chip.count}
					countTone="plain"
					isSelected={chip.isSelected}
					onToggle={() => (filter = chip.nextFilter)}
				/>
			{/each}
		</div>
	{/each}
</div>
