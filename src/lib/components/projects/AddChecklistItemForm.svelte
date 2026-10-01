<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	let { checklistId }: { checklistId: string } = $props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/addChecklistItem"
	use:enhance={tracker.submit()}
	class="flex flex-col gap-2 border-t border-hairline px-4 py-2.5"
>
	<div class="flex items-center gap-2">
		<input type="hidden" name="checklistId" value={checklistId} />
		<input
			name="description"
			required
			placeholder="Add an item"
			class="flex-1 rounded-xl border border-hairline bg-night px-4 py-2 text-sm text-chalk
				outline-none focus:border-go"
		/>
		<SubmitButton
			isSaving={tracker.isSaving}
			savingLabel="Adding…"
			class="rounded-full border border-hairline px-4 py-1.5 font-display text-sm text-chalk/70
				transition hover:border-go hover:text-go"
		>
			Add
		</SubmitButton>
	</div>
	<FormErrorNote message={tracker.errorMessage} />
</form>
