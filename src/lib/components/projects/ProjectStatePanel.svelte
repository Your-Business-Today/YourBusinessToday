<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { accountNameLookup } from '$lib/data/accountNames';
	import { countOf } from '$lib/data/countOf';
	import { projectVerdictLabels, projectVerdictMeanings } from '$lib/data/projectVerdict';
	import { projectVerdictTones } from './projectVerdictTones';
	import { waitedFor, wholeDaysSince } from '$lib/data/ageInDays';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { ProjectState } from '$lib/server/projects/projectState';

	let { projectState, people }: { projectState: ProjectState; people: ProjectPerson[] } = $props();

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
	const goalLines = $derived(
		goals.map(({ title, doneCount, buildingCount, waitingCount, openCount }) => ({
			title,
			counts: `${doneCount} done, ${buildingCount} building, ${waitingCount} waiting, ${openCount} to start`
		}))
	);
	const week = $derived(
		`${countOf(projectState.mergedThisWeekCount, 'task')} merged this week, ` +
			`${countOf(projectState.bugsFixedThisWeekCount, 'bug')} fixed`
	);
</script>

<DashboardPanel title="How it stands">
	<div class="flex flex-col gap-3 px-4 py-3 text-sm text-chalk/80">
		<div class="flex flex-wrap items-center gap-3">
			<span class={`rounded-full border px-3 py-1 font-display text-sm font-semibold ${projectVerdictTones[verdict]}`}>
				{projectVerdictLabels[verdict]}
			</span>
			<span class="text-chalk/60">{projectVerdictMeanings[verdict]}</span>
		</div>
		{#if openBugs.length > 0}
			<p>{countOf(openBugs.length, 'open bug')}, the oldest open for {waitedFor(oldestBugDays)}.</p>
		{/if}
		{#if blockingLines.length > 0}
			<ul class="flex flex-col gap-1">
				{#each blockingLines as line (line)}<li>{line}</li>{/each}
			</ul>
		{/if}
		{#if goalLines.length > 0}
			<ul class="flex flex-col gap-1">
				{#each goalLines as goal (goal.title)}<li><span class="text-chalk">{goal.title}</span>: {goal.counts}</li>{/each}
			</ul>
		{/if}
		<p class="text-chalk/60">{week}.</p>
		{#if nextStep !== null}
			<p>Next: <a class="text-chalk underline" href={`/projects/${nextStep.projectId}/tasks/${nextStep.taskId}`}>{nextStep.title}</a></p>
		{/if}
	</div>
</DashboardPanel>
