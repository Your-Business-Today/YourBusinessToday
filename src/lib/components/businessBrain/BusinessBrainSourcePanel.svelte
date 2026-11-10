<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { panelEmptyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BusinessBrainSourceRead } from '$lib/server/businessBrain/readBusinessBrainPageWhole';

	let { source }: { source: BusinessBrainSourceRead | null } = $props();
</script>

<DashboardPanel title="Where it came from">
	{#if source === null}
		<p class={panelEmptyClasses}>Where this page came from is not recorded.</p>
	{:else}
		<div class="flex flex-col gap-2 px-6 py-4 text-sm">
			<p class="font-display text-chalk">{source.title}</p>
			<p class="text-chalk-muted">{source.summary}</p>
			<p class="break-words text-chalk-subtle">{source.origin}</p>
			<p class="text-xs text-chalk-subtle">Filed {formatBritishDate(source.filedAt)}</p>
		</div>
	{/if}
</DashboardPanel>
