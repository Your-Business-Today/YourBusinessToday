<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import GoalHorizonField from './GoalHorizonField.svelte';
	import PriorityField from '$lib/components/site/PriorityField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { goalPriorityScope } from '$lib/data/goalHorizon';
	import { goalStatusLabels, goalStatusOrder } from '$lib/data/goalStatus';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { goal, onSaved }: { goal: Goal; onSaved: () => void } = $props();

	const tracker = new FormTracker();

	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<form method="POST" action="?/saveGoal" use:enhance={tracker.submit(onSaved)} class="flex flex-col gap-4">
	<SmallCapsField label="Goal">
		<input name="title" required value={goal.title} class={fieldClasses} />
	</SmallCapsField>
	<SmallCapsField label="Measure">
		<textarea name="measure" rows="3" class={fieldClasses}>{goal.measure}</textarea>
	</SmallCapsField>
	<div class="flex flex-wrap gap-4">
		<SmallCapsField label="Status">
			<select name="status" value={goal.status} class={fieldClasses}>
				{#each goalStatusOrder as statusOption (statusOption)}
					<option value={statusOption}>{goalStatusLabels[statusOption]}</option>
				{/each}
			</select>
		</SmallCapsField>
		<GoalHorizonField horizon={goal.horizon} />
		<PriorityField priority={goal.priority} among={goalPriorityScope(goal.horizon)} />
	</div>
	<p class="text-xs text-chalk/50">
		A goal with tasks is met when every task under it is done, and open again when one is not.
		Dropped stays until you change it. A goal moved to the other horizon goes last among the
		goals there.
	</p>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		Save
	</SubmitButton>
</form>
