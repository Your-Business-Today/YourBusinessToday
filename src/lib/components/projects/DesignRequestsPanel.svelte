<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import RequestedGoalSection from './RequestedGoalSection.svelte';
	import { designReviewStageName } from '$lib/data/designReview';
	import { panelEmptyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { RequestedGoal } from '$lib/data/requestedGoals';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let {
		requestedGoals,
		requestCount,
		canAnswer
	}: { requestedGoals: RequestedGoal<ProjectTask>[]; requestCount: number; canAnswer: boolean } = $props();
</script>

<DashboardPanel title={designReviewStageName} count={requestCount}>
	{#if requestedGoals.length === 0}
		<p class={panelEmptyClasses}>
			Nothing is waiting for YBT: every request on this project extends the design it already has.
		</p>
	{:else}
		{#each requestedGoals as plan, index (index)}
			<RequestedGoalSection {plan} {canAnswer} />
		{/each}
	{/if}
</DashboardPanel>
