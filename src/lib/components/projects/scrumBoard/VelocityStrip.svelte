<script lang="ts">
	import { velocityWeekCount, weekLabelOf, type Velocity } from '$lib/data/weeklyVelocity';

	let { velocity }: { velocity: Velocity } = $props();

	const emptyWeekScale = 1;
	const fullBar = 100;
	const mostPoints = $derived(Math.max(...velocity.weeks.map((week) => week.points), emptyWeekScale));

	function barHeightOf(points: number): string {
		return `${(points / mostPoints) * fullBar}%`;
	}
</script>

<div class="flex flex-wrap items-end gap-x-6 gap-y-3" aria-label="Velocity: story points that went live each week">
	<ol class="flex items-end gap-2">
		{#each velocity.weeks as week (week.weekStart)}
			<li class="flex w-12 flex-col items-center gap-1" title={`Week of ${weekLabelOf(week.weekStart)}: ${week.points} points went live`}>
				<span class="font-display text-xs text-chalk">{week.points}</span>
				<span class="flex h-10 w-full items-end rounded-sm bg-night/40">
					<span class="w-full rounded-sm bg-go/60" style:height={barHeightOf(week.points)}></span>
				</span>
				<span class="font-display text-[0.65rem] whitespace-nowrap text-chalk-faint">{weekLabelOf(week.weekStart)}</span>
			</li>
		{/each}
	</ol>
	<p class="flex flex-col">
		<span class="font-display text-2xl font-semibold text-chalk">{velocity.averagePoints}</span>
		<span class="text-xs text-chalk-subtle">points a week, the average of the last {velocityWeekCount} weeks</span>
	</p>
</div>
