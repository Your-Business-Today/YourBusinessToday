<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DesignRequestRow from './DesignRequestRow.svelte';
	import { designReviewStageName } from '$lib/data/designReview';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { requestedTasks }: { requestedTasks: ProjectTask[] } = $props();
</script>

<DashboardPanel title={designReviewStageName} count={requestedTasks.length}>
	{#if requestedTasks.length === 0}
		<p class={panelEmptyClasses}>
			Nothing is waiting for YBT: every request on this project extends the design it already has.
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each requestedTasks as task (task.id)}
				<DesignRequestRow {task} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
