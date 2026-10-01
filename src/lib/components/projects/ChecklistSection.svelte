<script lang="ts">
	import { enhance } from '$app/forms';
	import ChecklistPanel from './ChecklistPanel.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { panelButtonClasses, panelEmptyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { TaskChecklist } from '$lib/server/projects/checklistRecord';

	let { checklists }: { checklists: TaskChecklist[] } = $props();

	let isAddModalOpen = $state(false);

	const tracker = new FormTracker();

	$effect(() => {
		if (!isAddModalOpen) tracker.reset();
	});
</script>

<DashboardPanel title="Lists" count={checklists.length}>
	{#snippet actions()}
		<button type="button" onclick={() => (isAddModalOpen = true)} class={panelButtonClasses}>
			＋ List
		</button>
	{/snippet}
	{#if checklists.length === 0}
		<p class={panelEmptyClasses}>
			No lists yet — add one to track side work like a UAT run or a launch checklist.
		</p>
	{:else}
		{#each checklists as checklist (checklist.id)}
			<ChecklistPanel {checklist} />
		{/each}
	{/if}
</DashboardPanel>

<Modal title="Add list" bind:isOpen={isAddModalOpen}>
	<form
		method="POST"
		action="?/addChecklist"
		use:enhance={tracker.submit(() => (isAddModalOpen = false))}
		class="flex flex-col gap-4"
	>
		<label class="flex flex-col gap-1">
			<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Title</span>
			<input
				name="title"
				required
				placeholder="UAT tests"
				class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
					focus:border-go"
			/>
		</label>
		<FormErrorNote message={tracker.errorMessage} />
		<SubmitButton
			isSaving={tracker.isSaving}
			savingLabel="Adding…"
			class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
				transition hover:brightness-110"
		>
			Add
		</SubmitButton>
	</form>
</Modal>
