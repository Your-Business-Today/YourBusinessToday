<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from './FormErrorNote.svelte';
	import Modal from './Modal.svelte';
	import PriorityField from './PriorityField.svelte';
	import SubmitButton from './SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	let {
		itemName,
		priority,
		among,
		action,
		fields,
		isOpen = $bindable()
	}: {
		itemName: string;
		priority: number;
		among: string;
		action: string;
		fields: Record<string, string>;
		isOpen: boolean;
	} = $props();

	const tracker = new FormTracker();

	$effect(() => {
		if (!isOpen) tracker.reset();
	});

	function close() {
		isOpen = false;
	}
</script>

<Modal title="Set priority" bind:isOpen maxWidthClass="max-w-sm">
	<form method="POST" {action} use:enhance={tracker.submit(close)} class="flex flex-col gap-4">
		<p class="text-sm text-chalk/70">{itemName}</p>
		{#each Object.entries(fields) as [fieldName, fieldValue] (fieldName)}
			<input type="hidden" name={fieldName} value={fieldValue} />
		{/each}
		<PriorityField {priority} {among} />
		<FormErrorNote message={tracker.errorMessage} />
		<div class="flex justify-end gap-3">
			<button
				type="button"
				onclick={close}
				class="rounded-full border border-hairline px-5 py-2 font-display text-sm text-chalk/70
					transition hover:border-chalk/40 hover:text-chalk"
			>
				Cancel
			</button>
			<SubmitButton isSaving={tracker.isSaving}>Save</SubmitButton>
		</div>
	</form>
</Modal>
