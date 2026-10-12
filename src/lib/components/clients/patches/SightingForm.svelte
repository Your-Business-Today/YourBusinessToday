<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { confirmButtonClasses, inputClasses, selectClasses } from '$lib/components/site/formStyles';
	import { longestSightingAddress, longestSightingName, longestSightingNote, sightingSourceLabels, sightingSourceOrder } from '$lib/data/sightingRules';

	let { patchId, sector, action = '?/recordSighting' }: { patchId: string; sector: string; action?: string } = $props();
</script>

<form method="POST" {action} class="flex flex-col gap-3">
	<input type="hidden" name="patchId" value={patchId} />
	<input type="hidden" name="sector" value={sector} />
	<div class="grid gap-3 sm:grid-cols-2">
		<FormField label="Business">
			<input name="businessName" required maxlength={longestSightingName} placeholder="Thames Ditton Joinery" class={inputClasses} />
		</FormField>
		<FormField label="Postcode (optional)">
			<input name="postcode" placeholder={`${sector}..`} autocapitalize="characters" class={inputClasses} />
		</FormField>
		<FormField label="Address (optional)">
			<input name="address" maxlength={longestSightingAddress} placeholder="12 Eden Street" class={inputClasses} />
		</FormField>
		<FormField label="Website (optional)">
			<input name="website" type="url" placeholder="https://" class={inputClasses} />
		</FormField>
		<FormField label="Seen on">
			<input name="sourceUrl" type="url" required placeholder="https://the public page it was read on" class={inputClasses} />
		</FormField>
		<FormField label="Kind of page">
			<select name="sourceKind" class={selectClasses}>
				{#each sightingSourceOrder as kind (kind)}
					<option value={kind}>{sightingSourceLabels[kind]}</option>
				{/each}
			</select>
		</FormField>
	</div>
	<FormField label="What the page showed">
		<input name="whatWasSeen" required maxlength={longestSightingNote} placeholder="Family-run joinery workshop, trading since 1998" class={inputClasses} />
	</FormField>
	<div class="flex justify-end">
		<SubmitButton class={confirmButtonClasses} savingLabel="Recording…">Record sighting</SubmitButton>
	</div>
</form>
