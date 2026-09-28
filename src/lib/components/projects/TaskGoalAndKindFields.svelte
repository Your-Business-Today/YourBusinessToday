<script lang="ts">
	import { taskKindLabels, taskKindOrder, type TaskKind } from '$lib/data/taskKind';
	import type { Goal } from '$lib/server/goals/goalRecord';

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

	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<div class="grid gap-4 sm:grid-cols-2">
	<label class="flex flex-col gap-1">
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Goal</span>
		<select name="goalId" value={goalId ?? ''} class={fieldClasses}>
			<option value="">No goal</option>
			{#each goals as goal (goal.id)}
				<option value={goal.id}>{goal.title}</option>
			{/each}
		</select>
	</label>
	{#if shouldOfferKind}
		<label class="flex flex-col gap-1">
			<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Kind</span>
			<select name="kind" bind:value={kind} class={fieldClasses}>
				{#each taskKindOrder as kindOption (kindOption)}
					<option value={kindOption}>{taskKindLabels[kindOption]}</option>
				{/each}
			</select>
		</label>
	{/if}
</div>
