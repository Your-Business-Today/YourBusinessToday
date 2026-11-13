<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import StagePill from './StagePill.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { clientStageOrder, type ClientStage } from '$lib/data/clientLifecycle';

	let {
		clientId,
		clientName,
		stage,
		isOpen = $bindable()
	}: { clientId: string; clientName: string; stage: ClientStage; isOpen: boolean } = $props();

	const tracker = new FormTracker();

	let chosenStage = $state<ClientStage>('lead');

	$effect(() => {
		if (!isOpen) return;
		chosenStage = stage;
		tracker.reset();
	});

	function close() {
		isOpen = false;
	}
</script>

<Modal title="Set status" bind:isOpen maxWidthClass="max-w-sm">
	<form method="POST" action="?/moveStage" use:enhance={tracker.submit(close)} class="flex flex-col gap-5">
		<input type="hidden" name="clientId" value={clientId} />
		<fieldset class="flex flex-col gap-1">
			<legend class="mb-3 text-sm text-chalk-subtle">{clientName}</legend>
			{#each clientStageOrder as candidate (candidate)}
				<label class="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-carriage-raised">
					<input type="radio" name="stage" value={candidate} bind:group={chosenStage} class="accent-go" />
					<StagePill stage={candidate} />
				</label>
			{/each}
		</fieldset>
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
			<SubmitButton isSaving={tracker.isSaving} disabled={chosenStage === stage}>Save</SubmitButton>
		</div>
	</form>
</Modal>
