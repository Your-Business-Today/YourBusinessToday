<script lang="ts">
	import ApproveGoalPlanForm from './ApproveGoalPlanForm.svelte';
	import DesignRequestRow from './DesignRequestRow.svelte';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { RequestedGoal } from '$lib/data/requestedGoals';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let { plan, canAnswer }: { plan: RequestedGoal<ProjectTask, Goal>; canAnswer: boolean } = $props();

	const heading = $derived(plan.goal?.title ?? 'Requests under no goal');
	const approveLabel = $derived(plan.goal === null ? 'Approve these requests' : 'Approve the goal and its plan');
</script>

<section class="border-t border-hairline first:border-t-0">
	<header class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
		<h3 class="min-w-0 font-display text-sm text-chalk/90">{heading}</h3>
		{#if canAnswer}
			<ApproveGoalPlanForm goalId={plan.goal?.id ?? ''} label={approveLabel} />
		{/if}
	</header>
	<ul class={panelListClasses}>
		{#each plan.tasks as { task, chunks } (task.id)}
			<DesignRequestRow {task} {chunks} {canAnswer} />
		{/each}
	</ul>
</section>
