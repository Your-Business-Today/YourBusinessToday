<script lang="ts">
	import FinishedProjectsToggle from './FinishedProjectsToggle.svelte';
	import { paneToolbarClasses } from '$lib/components/workspace/workspaceStyles';

	let {
		searchText = $bindable(),
		isShowingFinished = $bindable(),
		finishedCount,
		countLabel
	}: {
		searchText: string;
		isShowingFinished: boolean;
		finishedCount: number;
		countLabel: string;
	} = $props();
</script>

<div class={paneToolbarClasses}>
	<FinishedProjectsToggle bind:isShowingFinished {finishedCount} />
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
