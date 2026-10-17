<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import PointsSelect from './PointsSelect.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { buildModelLimits, type BuildModel } from '$lib/data/buildModels';

	let { model, isNew = false }: { model: BuildModel; isNew?: boolean } = $props();

	const tracker = new FormTracker();
	const fieldClass =
		'rounded-full border border-hairline bg-night px-4 py-1.5 text-sm text-chalk outline-none focus:border-go';
</script>

<li class="flex flex-col gap-2 py-3">
	<form method="POST" action="?/saveBuildModel" use:enhance={tracker.submit()} class="flex flex-wrap items-center gap-3">
		{#if isNew}
			<input name="modelId" required maxlength={buildModelLimits.longestModelId}
				pattern="[a-z0-9][a-z0-9.:_\-]*" placeholder="model id" class={fieldClass} />
		{:else}
			<input type="hidden" name="modelId" value={model.modelId} />
			<code class="min-w-32 text-xs text-chalk/60">{model.modelId}</code>
		{/if}
		<input name="label" required maxlength={buildModelLimits.longestLabel} value={model.label}
			placeholder="label" class={fieldClass} />
		<input name="runsOn" maxlength={buildModelLimits.longestRunsOn} value={model.runsOn}
			placeholder="runs on, e.g. Claude Opus 5.5" class={fieldClass} />
		<PointsSelect name="leastPoints" label="from" value={model.leastPoints} />
		<PointsSelect name="mostPoints" label="to" value={model.mostPoints} />
		<SubmitButton isSaving={tracker.isSaving} savingLabel="Saving…"
			class="rounded-full border border-go/60 px-4 py-1.5 font-display text-sm text-go transition
				hover:bg-go hover:text-night">
			{isNew ? 'Add' : 'Save'}
		</SubmitButton>
		{#if !isNew}
			<button formaction="?/removeBuildModel" formnovalidate
				class="font-display text-xs text-chalk/50 underline transition hover:text-signal">
				Remove
			</button>
		{/if}
	</form>
	<FormErrorNote message={tracker.errorMessage} />
</li>
