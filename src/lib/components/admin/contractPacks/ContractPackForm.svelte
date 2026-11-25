<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import PackChoiceList from './PackChoiceList.svelte';
	import { contractPackLimits } from '$lib/data/contractPackRules';
	import { writtenBlankFieldPrefix } from '$lib/data/contractPackForm';
	import type { ContractBlank } from '$lib/data/contractBlanks';
	import type { PackChoice } from './packChoice';

	let {
		organisationId,
		documents,
		clauses,
		writtenBlanks,
		errorMessage
	}: { organisationId: string; documents: PackChoice[]; clauses: PackChoice[]; writtenBlanks: ContractBlank[]; errorMessage: string | null } = $props();

	let isPreparing = $state(false);

	function preparing() {
		isPreparing = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			isPreparing = false;
		};
	}
</script>

<form method="post" action="?/prepare" use:enhance={preparing} class="flex flex-col gap-6">
	<input type="hidden" name="organisationId" value={organisationId} />
	<PackChoiceList heading="Documents" fieldName="documents" choices={documents} />
	<PackChoiceList heading="Optional clauses" fieldName="clauses" choices={clauses} />
	<fieldset class="flex flex-col gap-3">
		<legend class="font-display text-base text-chalk">Written into this pack</legend>
		<p class="text-xs text-chalk/50">The client's details come from their organisation and the fees from their latest quote. Anything left empty stays in its brackets.</p>
		{#each writtenBlanks as blank (blank.label)}
			<FormField label={blank.label} hint={blank.meaning}>
				<input type="text" name={`${writtenBlankFieldPrefix}${blank.label}`} maxlength={contractPackLimits.longestBlankValue} />
			</FormField>
		{/each}
	</fieldset>
	<FormErrorNote message={errorMessage} />
	<div><Button type="submit" look="primary" isSaving={isPreparing} savingLabel="Preparing…">Prepare the pack</Button></div>
</form>
