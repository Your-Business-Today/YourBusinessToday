<script lang="ts">
	import { enhance } from '$app/forms';
	import CriterionRow from './CriterionRow.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { panelButtonClasses, panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { AcceptanceCriterion } from '$lib/server/projects/criterionRecord';

	let { criteria }: { criteria: AcceptanceCriterion[] } = $props();

	let isAddModalOpen = $state(false);

	const metCount = $derived(criteria.filter((criterion) => criterion.isMet).length);

	const tracker = new FormTracker();

	$effect(() => {
		if (!isAddModalOpen) tracker.reset();
	});
</script>

<DashboardPanel title="Acceptance criteria" count={criteria.length > 0 ? `${metCount}/${criteria.length}` : null}>
	{#snippet actions()}
		<button type="button" onclick={() => (isAddModalOpen = true)} class={panelButtonClasses}>
			＋ Criterion
		</button>
	{/snippet}
	{#if criteria.length === 0}
		<p class={panelEmptyClasses}>
			No acceptance criteria yet — add what must be true for this story to be done.
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each criteria as criterion (criterion.id)}
				<CriterionRow {criterion} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>

<Modal title="Add acceptance criterion" bind:isOpen={isAddModalOpen}>
	<form
		method="POST"
		action="?/addCriterion"
		use:enhance={tracker.submit(() => (isAddModalOpen = false))}
		class="flex flex-col gap-4"
	>
		<label class="flex flex-col gap-1">
			<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Criterion</span>
			<input
				name="description"
				required
				placeholder="What must be true for this story to be done"
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
