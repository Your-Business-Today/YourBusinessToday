<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { enhance } from '$app/forms';
	import { staffOnlyAutocompleteRefusal } from '$lib/data/autocompleteStanding';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let { goal, canTurnOnAutocomplete }: { goal: Goal; canTurnOnAutocomplete: boolean } = $props();

	const tracker = new FormTracker();
	const summary = $derived(
		goal.isAutocomplete
			? 'On: an AI running on a schedule may take this goal’s tasks through to merged without asking.'
			: 'Off: a person gives input before an AI completes this goal’s tasks.'
	);
	const canSwitch = $derived(goal.isAutocomplete || canTurnOnAutocomplete);
</script>

<DashboardPanel title="Autocomplete">
	<form
		method="POST"
		action="?/setGoalAutocomplete"
		use:enhance={tracker.submit()}
		class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
	>
		<input type="hidden" name="isAutocomplete" value={String(!goal.isAutocomplete)} />
		<p class="min-w-0 text-chalk/70">{summary} A task with its own setting keeps it.</p>
		{#if canSwitch}
			<SubmitButton
				isSaving={tracker.isSaving}
				savingLabel="Saving…"
				class="shrink-0 rounded-full border border-hairline px-3 py-1 font-display text-xs text-chalk/70
					transition hover:border-go hover:text-go"
			>
				{goal.isAutocomplete ? 'Turn off' : 'Turn on'}
			</SubmitButton>
		{:else}
			<p class="shrink-0 text-xs text-chalk/45">{staffOnlyAutocompleteRefusal}</p>
		{/if}
	</form>
	<FormErrorNote message={tracker.errorMessage} />
</DashboardPanel>
