<script lang="ts">
	import { goalHorizonLabels, goalHorizonOrder, goalsOnHorizon } from '$lib/data/goalHorizon';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let { goals }: { goals: Goal[] } = $props();
</script>

<option value="">No goal</option>
{#each goalHorizonOrder as horizon (horizon)}
	<optgroup label={`${goalHorizonLabels[horizon]} goals`}>
		{#each goalsOnHorizon(goals, horizon) as goal (goal.id)}
			<option value={goal.id}>{goal.title}</option>
		{/each}
	</optgroup>
{/each}
