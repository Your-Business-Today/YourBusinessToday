<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { addLibraryItem } from './addLibraryItem';
	import { invalidateAll } from '$app/navigation';
	import { LibraryLimits, libraryFileKinds } from '$lib/brand/library/libraryLimits';
	import { libraryLimitHint } from './brandLibraryPageWords';
	import { PostingFootings, postingFootings } from '$lib/brand/library/libraryItem';
	import { postingFootingLabels } from '$lib/brand/library/libraryWords';

	let { today }: { today: string } = $props();

	let posting = $state<string>(PostingFootings.permissionGiven);
	let formRound = $state(0);
	let isSaving = $state(false);
	let errorMessage = $state<string | null>(null);
	const isPermissionGiven = $derived(posting === PostingFootings.permissionGiven);

	function startAfresh() {
		posting = PostingFootings.permissionGiven;
		formRound += 1;
	}

	async function addItem(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		isSaving = true;
		try {
			errorMessage = await addLibraryItem(form);
			if (errorMessage === null) startAfresh();
			await invalidateAll();
		} finally {
			isSaving = false;
		}
	}
</script>

{#key formRound}
<form onsubmit={addItem} class="flex flex-col gap-4">
	<FormField label="Photo or video" hint={libraryLimitHint}>
		<input type="file" name="file" accept={libraryFileKinds} required />
	</FormField>
	<FormField label="What it shows">
		<textarea name="shows" rows="3" maxlength={LibraryLimits.showsCharacters} required></textarea>
	</FormField>
	<FormField label="When it was taken">
		<input type="date" name="takenOn" min={LibraryLimits.earliestTakenOn} max={today} required />
	</FormField>
	<fieldset class="flex flex-col gap-2">
		<legend class="mb-1 text-sm font-medium text-chalk-subtle">May it be posted?</legend>
		{#each postingFootings as footing (footing)}
			<label class="flex items-start gap-2 text-sm text-chalk-muted">
				<input type="radio" name="posting" value={footing} bind:group={posting} class="mt-1" required />
				{postingFootingLabels[footing]}
			</label>
		{/each}
	</fieldset>
	{#if isPermissionGiven}
		<FormField label="Who gave permission" hint="Such as the homeowner, by name.">
			<input type="text" name="permissionGivenBy" maxlength={LibraryLimits.permissionGiverCharacters} required />
		</FormField>
	{/if}
	<FormErrorNote message={errorMessage} />
	<div class="flex justify-end">
		<Button type="submit" look="primary" {isSaving} savingLabel="Adding…">Add to the library</Button>
	</div>
</form>
{/key}
