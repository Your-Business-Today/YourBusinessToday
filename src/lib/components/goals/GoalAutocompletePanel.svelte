<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { enhance } from '$app/forms';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let { goal }: { goal: Goal } = $props();

	const tracker = new FormTracker();
	const summary = $derived(
		goal.isAutocomplete
			? 'On: an AI running on a schedule may take this goal’s tasks through to merged without asking.'
			: 'Off: a person gives input before an AI completes this goal’s tasks.'
	);
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
		<SubmitButton
			isSaving={tracker.isSaving}
			savingLabel="Saving…"
			class="shrink-0 rounded-full border border-hairline px-3 py-1 font-display text-xs text-chalk/70
				transition hover:border-go hover:text-go"
		>
			{goal.isAutocomplete ? 'Turn off' : 'Turn on'}
		</SubmitButton>
	</form>
	<FormErrorNote message={tracker.errorMessage} />
</DashboardPanel>
