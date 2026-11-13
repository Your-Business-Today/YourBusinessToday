<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { confirmButtonClasses, fieldClasses } from '$lib/components/site/formStyles';
	import { stationMarkChoices } from '$lib/data/workflowMap/stationReviewWords';
	import { stationReviewLimits } from '$lib/data/workflowMap/stationReviewLimits';
	import { stationReviewStates, type StationReviewState, type StationStanding } from '$lib/data/workflowMap/stationReview';
	import { untrack } from 'svelte';
	import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

	let { map, stationKey, standing }: { map: WorkflowMapVersion; stationKey: string; standing: StationStanding } = $props();

	const tracker = new FormTracker();
	let chosenState = $state<StationReviewState>(untrack(() => standing.reviewState));
	const isNotRight = $derived(chosenState === stationReviewStates.notRight);
</script>

<form method="POST" action="?/markStation" use:enhance={tracker.submit(undefined, { shouldKeepFields: true })} class="flex flex-col gap-3">
	<input type="hidden" name="stage" value={map.stage} />
	<input type="hidden" name="versionNumber" value={map.versionNumber} />
	<input type="hidden" name="stationKey" value={stationKey} />
	<fieldset class="flex flex-col gap-2">
		<legend class="mb-2 text-chalk-muted">Is this station right?</legend>
		<div class="flex gap-5">
			{#each stationMarkChoices as choice (choice.state)}
				<label class="flex items-center gap-2 text-chalk">
					<input type="radio" name="reviewState" value={choice.state} bind:group={chosenState} required />
					{choice.label}
				</label>
			{/each}
		</div>
	</fieldset>
	{#if isNotRight}
		<FormField label="What is wrong">
			<textarea
				name="whatIsWrong"
				required
				rows="3"
				maxlength={stationReviewLimits.whatIsWrongLength}
				placeholder="Say it as you would to a colleague: the next version puts it right."
				class={fieldClasses}>{standing.whatIsWrong ?? ''}</textarea
			>
		</FormField>
	{/if}
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} class={`${confirmButtonClasses} self-start`}>Save</SubmitButton>
</form>
