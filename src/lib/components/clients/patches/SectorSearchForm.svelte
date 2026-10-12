<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { confirmButtonClasses, inputClasses, selectClasses } from '$lib/components/site/formStyles';
	import { longestSectorSummary } from '$lib/data/sectorSearchRules';
	import { searchSourceLabels, searchSourceOrder } from '$lib/data/searchSources';

	let { patchId, sector, action = '?/markSearched' }: { patchId: string; sector: string; action?: string } = $props();
</script>

<form method="POST" {action} class="flex flex-col gap-3">
	<input type="hidden" name="patchId" value={patchId} />
	<input type="hidden" name="sector" value={sector} />
	<div class="grid gap-3 sm:grid-cols-[1fr_7rem]">
		<FormField label="Searched">
			<select name="source" class={selectClasses}>
				{#each searchSourceOrder as source (source)}
					<option value={source}>{searchSourceLabels[source]}</option>
				{/each}
			</select>
		</FormField>
		<FormField label="Found">
			<input name="foundCount" type="number" min="0" step="1" value="0" required class={inputClasses} />
		</FormField>
	</div>
	<FormField label="What was done, in one line">
		<input name="summary" required maxlength={longestSectorSummary} placeholder="12 businesses found, 4 on the register" class={inputClasses} />
	</FormField>
	<div class="flex justify-end">
		<SubmitButton class={confirmButtonClasses} savingLabel="Marking…">Mark searched</SubmitButton>
	</div>
</form>
