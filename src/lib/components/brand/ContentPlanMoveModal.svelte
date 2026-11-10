<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { PlanEntry } from '$lib/brand/plan/contentPlan';

	let { entry, isOpen = $bindable() }: { entry: PlanEntry | null; isOpen: boolean } = $props();

	const tracker = new FormTracker();
	const close = () => (isOpen = false);
</script>

<Modal title={`Move “${entry?.title ?? ''}” on ${entry?.medium ?? ''}`} bind:isOpen>
	{#if entry !== null}
		<form method="POST" action="?/move" use:enhance={tracker.submit(close, { shouldKeepFields: true })} class="flex flex-col gap-4">
			<input type="hidden" name="contentPieceId" value={entry.id} />
			<FormField label="Day it goes out">
				<input type="date" name="date" value={entry.date} required />
			</FormField>
			<FormField label="Time" hint="On the UK clock.">
				<input type="time" name="time" value={entry.time} required />
			</FormField>
			<FormErrorNote message={tracker.errorMessage} />
			<div class="flex flex-wrap justify-end gap-2">
				<Button onclick={close} disabled={tracker.isSaving}>Cancel</Button>
				<Button type="submit" look="primary" isSaving={tracker.isSaving}>Move it</Button>
			</div>
		</form>
	{/if}
</Modal>
