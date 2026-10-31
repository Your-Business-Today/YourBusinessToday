<script lang="ts">
	import GoalRow from './GoalRow.svelte';
	import { flip } from 'svelte/animate';
	import { rowMove } from '$lib/client/motion';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { GoalSummary } from '$lib/server/goals/summariseGoals';

	let {
		goalSummaries,
		onSetPriority
	}: { goalSummaries: GoalSummary[]; onSetPriority: (goalSummary: GoalSummary) => void } = $props();
</script>

<ul class={panelListClasses}>
	{#each goalSummaries as goalSummary, goalIndex (goalSummary.id)}
		<li animate:flip={rowMove}>
			<GoalRow
				{goalSummary}
				isFirst={goalIndex === 0}
				isLast={goalIndex === goalSummaries.length - 1}
				onSetPriority={onSetPriority}
			/>
		</li>
	{/each}
</ul>
