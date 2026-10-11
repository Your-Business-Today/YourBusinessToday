<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import GoalSelectOptions from './GoalSelectOptions.svelte';
	import { taskKindLabels, taskKindOrder, type TaskKind } from '$lib/data/taskKind';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let {
		goals,
		goalId = null,
		kind = $bindable('work'),
		shouldOfferKind = true
	}: {
		goals: Goal[];
		goalId?: string | null;
		kind?: TaskKind;
		shouldOfferKind?: boolean;
	} = $props();
</script>

<div class="grid gap-4 sm:grid-cols-2">
	<SmallCapsField label="Goal">
		<select name="goalId" value={goalId ?? ''} class={fieldClasses}>
			<GoalSelectOptions {goals} />
		</select>
	</SmallCapsField>
	{#if shouldOfferKind}
		<SmallCapsField label="Kind">
			<select name="kind" bind:value={kind} class={fieldClasses}>
				{#each taskKindOrder as kindOption (kindOption)}
					<option value={kindOption}>{taskKindLabels[kindOption]}</option>
				{/each}
			</select>
		</SmallCapsField>
	{/if}
</div>
