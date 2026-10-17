<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { BuildModelSettings } from '$lib/data/buildModels';

	let { settings }: { settings: BuildModelSettings } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/setReviewModel" use:enhance={tracker.submit()}
	class="flex flex-wrap items-center gap-3">
	<label for="review-model" class="text-sm text-chalk/70">Reviews local builds</label>
	<select id="review-model" name="modelId" value={settings.reviewModelId}
		class="min-w-48 rounded-full border border-hairline bg-night px-4 py-2 text-sm text-chalk
			outline-none focus:border-go">
		{#each settings.models as model (model.modelId)}
			<option value={model.modelId}>{model.label}</option>
		{/each}
	</select>
	<SubmitButton isSaving={tracker.isSaving} savingLabel="Saving…"
		class="rounded-full border border-go/60 px-4 py-1.5 font-display text-sm text-go transition
			hover:bg-go hover:text-night">
		Save
	</SubmitButton>
	<FormErrorNote message={tracker.errorMessage} />
</form>
