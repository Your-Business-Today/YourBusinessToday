<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import GoalHorizonField from './GoalHorizonField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { GoalHorizon } from '$lib/data/goalHorizon';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { horizon, onCreated }: { horizon: GoalHorizon; onCreated: () => void } = $props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/createGoal"
	use:enhance={tracker.submit(onCreated)}
	class="flex flex-col gap-4"
>
	<SmallCapsField label="Goal">
		<input name="title" required placeholder="What the project must achieve" class={fieldClasses} />
	</SmallCapsField>
	<SmallCapsField label="Measure">
		<textarea
			name="measure"
			rows="2"
			placeholder="How we will know it has been met"
			class={fieldClasses}
		></textarea>
	</SmallCapsField>
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
