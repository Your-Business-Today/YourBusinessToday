<script lang="ts">
	import { filterChipClasses } from './filterChipClasses';
	import {
		projectStatusFilterLabel,
		projectStatusFilterOrder,
		type ProjectStatusFilter
	} from '$lib/data/projectStatusFilter';

	let {
		searchText = $bindable(),
		selectedStatus = $bindable(),
		countLabel
	}: { searchText: string; selectedStatus: ProjectStatusFilter; countLabel: string } = $props();
</script>

<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
	<div class="scrollbar-hidden -mx-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
		{#each projectStatusFilterOrder as statusFilter (statusFilter)}
			<button
				type="button"
				onclick={() => (selectedStatus = statusFilter)}
				class={`shrink-0 ${filterChipClasses(selectedStatus === statusFilter)}`}
			>
				{projectStatusFilterLabel(statusFilter)}
			</button>
		{/each}
	</div>
	<div class="flex items-center gap-3">
		<span class="shrink-0 font-display text-xs text-chalk/50">{countLabel}</span>
		<input
			bind:value={searchText}
			type="search"
			placeholder="Search projects"
			aria-label="Search projects by name"
			class="w-full min-w-0 rounded-lg border border-hairline bg-carriage px-3 py-1.5 text-sm text-chalk
				outline-none focus:border-go md:w-64"
		/>
	</div>
</div>
