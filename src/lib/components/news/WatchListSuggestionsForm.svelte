<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { organisationSubmitClasses } from '$lib/components/organisations/organisationFormStyles';
	import { watchedThingKey } from '$lib/data/news/watchedThingKey';
	import { watchedKindLabels, type WatchedThingGiven } from '$lib/data/news/watchListRules';

	let { suggestions }: { suggestions: WatchedThingGiven[] } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/addSuggested" use:enhance={tracker.submit()} class="flex flex-col gap-4 p-6">
	<p class="text-sm text-chalk-subtle">From the organisation’s Domain and its clients register. Nothing here is watched until it is ticked and added.</p>
	<ul class="flex flex-col gap-2">
		{#each suggestions as suggestion (watchedThingKey(suggestion))}
			<li>
				<label class="flex items-center gap-3 text-sm text-chalk">
					<input type="checkbox" name="suggestion" value={watchedThingKey(suggestion)} class="accent-go" />
					<span class="text-chalk-faint">{watchedKindLabels[suggestion.kind]}</span>
					{suggestion.value}
					{#if suggestion.label !== ''}
						<span class="text-chalk-subtle">{suggestion.label}</span>
					{/if}
				</label>
			</li>
		{/each}
	</ul>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} class={organisationSubmitClasses}>Watch the ticked ones</SubmitButton>
</form>
