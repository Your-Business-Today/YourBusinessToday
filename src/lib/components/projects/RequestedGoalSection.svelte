<script lang="ts">
	import ApproveGoalPlanForm from './ApproveGoalPlanForm.svelte';
	import DesignRequestRow from './DesignRequestRow.svelte';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { RequestedGoal } from '$lib/data/requestedGoals';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { plan, canAnswer }: { plan: RequestedGoal<ProjectTask>; canAnswer: boolean } = $props();

	const { goalId, goalTitle, tasks } = $derived(plan);
	const heading = $derived(goalTitle ?? 'Requests under no goal');
	const approveLabel = $derived(goalId === null ? 'Approve these requests' : 'Approve the goal and its plan');
</script>

<section class="border-t border-hairline first:border-t-0">
	<header class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
		<h3 class="min-w-0 font-display text-sm text-chalk/90">{heading}</h3>
		{#if canAnswer}
			<ApproveGoalPlanForm goalId={goalId ?? ''} label={approveLabel} />
		{/if}
	</header>
	<ul class={panelListClasses}>
		{#each tasks as { task, chunks } (task.id)}
			<DesignRequestRow {task} {chunks} {canAnswer} />
		{/each}
	</ul>
</section>
