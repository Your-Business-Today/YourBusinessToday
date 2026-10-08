<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import PriorityField from '$lib/components/site/PriorityField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { goalStatusLabels, goalStatusOrder } from '$lib/data/goalStatus';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let { goal, onSaved }: { goal: Goal; onSaved: () => void } = $props();

	const tracker = new FormTracker();

	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<form method="POST" action="?/saveGoal" use:enhance={tracker.submit(onSaved)} class="flex flex-col gap-4">
	<label class="flex flex-col gap-1">
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Goal</span>
		<input name="title" required value={goal.title} class={fieldClasses} />
	</label>
	<label class="flex flex-col gap-1">
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Measure</span>
		<textarea name="measure" rows="3" class={fieldClasses}>{goal.measure}</textarea>
	</label>
	<div class="flex flex-wrap gap-4">
		<label class="flex flex-col gap-1">
			<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Status</span>
			<select name="status" value={goal.status} class={fieldClasses}>
				{#each goalStatusOrder as statusOption (statusOption)}
					<option value={statusOption}>{goalStatusLabels[statusOption]}</option>
				{/each}
			</select>
		</label>
		<PriorityField priority={goal.priority} among="of the project’s goals" />
	</div>
	<p class="text-xs text-chalk/50">
		A goal with tasks is met when every task under it is done, and open again when one is not.
		Dropped stays until you change it.
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
