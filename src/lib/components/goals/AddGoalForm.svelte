<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import GoalHorizonField from './GoalHorizonField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { GoalHorizon } from '$lib/data/goalHorizon';

	let { horizon, onCreated }: { horizon: GoalHorizon; onCreated: () => void } = $props();

	const tracker = new FormTracker();

	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<form
	method="POST"
	action="?/createGoal"
	use:enhance={tracker.submit(onCreated)}
	class="flex flex-col gap-4"
>
	<label class="flex flex-col gap-1">
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Goal</span>
		<input name="title" required placeholder="What the project must achieve" class={fieldClasses} />
	</label>
	<label class="flex flex-col gap-1">
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Measure</span>
		<textarea
			name="measure"
			rows="2"
			placeholder="How we will know it has been met"
			class={fieldClasses}
		></textarea>
	</label>
	<GoalHorizonField {horizon} />
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		savingLabel="Adding…"
		class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		Add goal
	</SubmitButton>
</form>
