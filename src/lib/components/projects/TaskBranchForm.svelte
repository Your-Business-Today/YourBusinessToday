<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { branchNameRules, longestBranchName } from '$lib/data/branchName';

	let { branchName, onSaved }: { branchName: string; onSaved: () => void } = $props();

	const tracker = new FormTracker();
</script>

<FormErrorNote message={tracker.errorMessage} />
<form
	method="POST"
	action="?/setBranch"
	use:enhance={tracker.submit(onSaved)}
	class="flex flex-wrap items-center gap-3"
>
	<input
		name="branchName"
		value={branchName}
		maxlength={longestBranchName}
		pattern="[A-Za-z0-9._\/\-]*"
		title={`A branch name is ${branchNameRules}`}
		placeholder="feature/weekly-cashflow-grid"
		class="w-full min-w-0 flex-1 rounded-xl border border-hairline bg-night px-4 py-2.5 font-display
			text-sm text-chalk outline-none focus:border-go"
	/>
	<SubmitButton
		isSaving={tracker.isSaving}
		class="rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night transition
			hover:brightness-110"
	>
		Save
	</SubmitButton>
</form>
