<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { organisationSubmitClasses } from '$lib/components/organisations/organisationFormStyles';
	import { watchedKindLabels, watchedKinds, watchedValueHints, watchedValuePatterns, watchListLimits, type WatchedKind } from '$lib/data/news/watchListRules';

	let { onAdded }: { onAdded: () => void } = $props();

	const tracker = new FormTracker();
	const firstKind: WatchedKind = 'sector_code';
	let kind: WatchedKind = $state(firstKind);
	const valuePattern = $derived(watchedValuePatterns[kind]?.source);
</script>

<form method="POST" action="?/addWatched" use:enhance={tracker.submit(onAdded, { shouldKeepFields: true })} class="flex flex-col gap-4">
	<FormField label="Kind">
		<select name="kind" bind:value={kind} required>
			{#each watchedKinds as watchedKind (watchedKind)}
				<option value={watchedKind}>{watchedKindLabels[watchedKind]}</option>
			{/each}
		</select>
	</FormField>
	<FormField label="Value" hint={watchedValueHints[kind]}>
		<input name="value" required maxlength={watchListLimits.longestValue} pattern={valuePattern} autocomplete="off" />
	</FormField>
	<FormField label="Called" hint="What it is called, such as the company’s name. Leave it blank when the value says it.">
		<input name="label" maxlength={watchListLimits.longestLabel} autocomplete="off" />
	</FormField>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} class={organisationSubmitClasses}>Watch it</SubmitButton>
</form>
