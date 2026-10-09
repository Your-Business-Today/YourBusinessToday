<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from './FormErrorNote.svelte';
	import SubmitButton from './SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	let {
		action,
		fields,
		submitLabel,
		confirmWord,
		onClose
	}: {
		action: string;
		fields: Record<string, string>;
		submitLabel: string;
		confirmWord: string | null;
		onClose: () => void;
	} = $props();

	let typedConfirmation = $state('');

	const isConfirmed = $derived(confirmWord === null || typedConfirmation === confirmWord);

	const tracker = new FormTracker();
</script>

<form method="POST" {action} use:enhance={tracker.submit(onClose)} class="mt-5 flex flex-col gap-4">
	{#each Object.entries(fields) as [fieldName, fieldValue] (fieldName)}
		<input type="hidden" name={fieldName} value={fieldValue} />
	{/each}
	{#if confirmWord !== null}
		<label class="flex flex-col gap-1 text-sm text-chalk/70">
			Type <span class="font-display text-chalk">{confirmWord}</span> to confirm
			<input
				bind:value={typedConfirmation}
				placeholder={confirmWord}
				class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk
					outline-none focus:border-signal"
			/>
		</label>
	{/if}
	<FormErrorNote message={tracker.errorMessage} />
	<div class="flex justify-end gap-3">
		<button
			type="button"
			onclick={onClose}
			class="rounded-full border border-hairline px-5 py-2 font-display text-sm
				text-chalk/70 transition hover:border-chalk/40 hover:text-chalk"
		>
			Cancel
		</button>
		<SubmitButton
			isSaving={tracker.isSaving}
			disabled={!isConfirmed}
			savingLabel="Deleting…"
			class="rounded-full bg-signal px-5 py-2 font-display text-sm font-medium text-night
				transition hover:brightness-110 disabled:opacity-40"
		>
			{submitLabel}
		</SubmitButton>
	</div>
</form>
