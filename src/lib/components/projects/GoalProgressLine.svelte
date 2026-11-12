<script lang="ts">
	import ProgressTrack from '$lib/components/workspace/ProgressTrack.svelte';
	import type { GoalProgress } from '$lib/server/projects/projectGoalProgress';

	let { goal, projectId }: { goal: GoalProgress; projectId: string } = $props();

	const wholePercent = 100;
	const taskCount = $derived(goal.doneCount + goal.buildingCount + goal.waitingCount + goal.openCount);
	const donePercent = $derived(taskCount === 0 ? 0 : Math.round((goal.doneCount * wholePercent) / taskCount));
	const isBuilding = $derived(goal.buildingCount > 0);
	const isWaiting = $derived(goal.waitingCount > 0);
	const fullReading = $derived(
		`${goal.title}: ${goal.doneCount} done, ${goal.buildingCount} building, ` +
			`${goal.waitingCount} waiting, ${goal.openCount} to start`
	);
</script>

<a
	href={`/projects/${projectId}/goals/${goal.goalId}`}
	title={fullReading}
	class="group/goal flex min-w-0 flex-col gap-1.5 py-1"
>
	<span class="flex min-w-0 items-baseline gap-2 text-xs">
		<span class="min-w-0 flex-1 truncate text-chalk/80 transition group-hover/goal:text-go">{goal.title}</span>
		{#if isWaiting}<span class="shrink-0 text-caution">{goal.waitingCount} waiting</span>{/if}
		{#if isBuilding}<span class="shrink-0 text-go">{goal.buildingCount} building</span>{/if}
		<span class="shrink-0 tabular-nums text-chalk/50">{goal.doneCount}/{taskCount}</span>
	</span>
	<ProgressTrack completionPercent={donePercent} />
</a>
