<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { TaskChecklist } from '$lib/server/projects/checklistRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { checklist, isOpen = $bindable() }: { checklist: TaskChecklist; isOpen: boolean } =
		$props();

	const tracker = new FormTracker();

	$effect(() => {
		if (!isOpen) tracker.reset();
	});
</script>

<Modal title="Rename list" bind:isOpen>
	<form
		method="POST"
		action="?/renameChecklist"
		use:enhance={tracker.submit(() => (isOpen = false))}
		class="flex flex-col gap-4"
	>
		<input type="hidden" name="checklistId" value={checklist.id} />
		<SmallCapsField label="Title">
			<input
				name="title"
				required
				value={checklist.title}
				class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
					focus:border-go"
			/>
		</SmallCapsField>
		<FormErrorNote message={tracker.errorMessage} />
		<SubmitButton
			isSaving={tracker.isSaving}
			savingLabel="Saving…"
			class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
				transition hover:brightness-110"
		>
			Save
		</SubmitButton>
	</form>
</Modal>
