<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DesignRequestRow from './DesignRequestRow.svelte';
	import { designReviewStageName } from '$lib/data/designReview';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { DesignRequestOnBoard } from '$lib/server/designReviews/findDesignRequests';

	let { designRequests }: { designRequests: DesignRequestOnBoard[] } = $props();
</script>

<DashboardPanel title={designReviewStageName} count={designRequests.length}>
	{#if designRequests.length === 0}
		<p class={panelEmptyClasses}>
			Nothing is waiting for YBT: every request on this project extends the design it already has.
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each designRequests as { task, change } (task.id)}
				<DesignRequestRow {task} {change} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
