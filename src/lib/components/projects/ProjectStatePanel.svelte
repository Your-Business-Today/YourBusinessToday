<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import GoalProgressLine from './GoalProgressLine.svelte';
	import { accountNameLookup } from '$lib/data/accountNames';
	import { countOf } from '$lib/data/countOf';
	import { projectVerdictLabels, projectVerdictMeanings } from '$lib/data/projectVerdict';
	import { projectVerdictTones } from './projectVerdictTones';
	import { waitedFor, wholeDaysSince } from '$lib/data/ageInDays';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { ProjectState } from '$lib/server/projects/projectState';

	let {
		projectState,
		people,
		projectId
	}: { projectState: ProjectState; people: ProjectPerson[]; projectId: string } = $props();

	const { verdict, openBugs, blocking, goals, nextStep } = $derived(projectState);
	const nameOf = $derived(accountNameLookup(people));
	const now = new Date();
	const oldestBugDays = $derived(Math.max(0, ...openBugs.map((bug) => wholeDaysSince(bug.createdAt, now))));
	const blockingLines = $derived(
		blocking.map(({ accountId, taskIds, oldestSince }) => {
			const age = waitedFor(wholeDaysSince(oldestSince, now));
			return `Waiting on ${nameOf(accountId)}: ${countOf(taskIds.length, 'task')}, the oldest for ${age}`;
		})
	);
	const week = $derived(
		`${projectState.mergedThisWeekCount} merged, ` +
			`${countOf(projectState.bugsFixedThisWeekCount, 'bug')} fixed this week`
	);
</script>

<DashboardPanel title="How it stands">
	{#snippet actions()}
		<span class="text-xs text-chalk/50">{week}</span>
		<span
			title={projectVerdictMeanings[verdict]}
			class={`rounded-full border px-2.5 py-0.5 font-display text-xs font-semibold ${projectVerdictTones[verdict]}`}
		>
			{projectVerdictLabels[verdict]}
		</span>
	{/snippet}
	<div class="flex flex-col gap-3 px-6 py-4 text-sm">
		{#if openBugs.length > 0}
			<p class="text-signal">{countOf(openBugs.length, 'open bug')}, the oldest open for {waitedFor(oldestBugDays)}</p>
		{/if}
		{#each blockingLines as line (line)}<p class="text-caution">{line}</p>{/each}
		{#if goals.length > 0}
			<div class="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-4">
				{#each goals as goal (goal.goalId)}<GoalProgressLine {goal} {projectId} />{/each}
			</div>
		{/if}
		{#if nextStep !== null}
			<p class="flex min-w-0 gap-2 text-xs">
				<span class="shrink-0 text-chalk/50">Next</span>
				<a
					class="min-w-0 truncate text-chalk/80 transition hover:text-go"
					title={nextStep.title}
					href={`/projects/${nextStep.projectId}/tasks/${nextStep.taskId}`}>{nextStep.title}</a
				>
			</p>
		{/if}
	</div>
</DashboardPanel>
