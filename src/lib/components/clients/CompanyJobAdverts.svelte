<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import JobAdvertRow from './JobAdvertRow.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { quietButtonClasses } from '$lib/components/site/formStyles';
	import type { CompanyJobAdverts } from '$lib/server/jobAdverts/jobAdvert';

	let { companyName, place = '' }: { companyName: string; place?: string } = $props();

	const tracker = new FormTracker();
	const form = $derived(page.form);
	const reading = $derived(form?.jobAdverts as CompanyJobAdverts | undefined);
	const adverts = $derived(reading?.companyName === companyName ? reading.adverts : null);
</script>

<div class="flex flex-col gap-2">
	<form method="POST" action="?/findJobAdverts" use:enhance={tracker.submit()}>
		<input type="hidden" name="companyName" value={companyName} />
		<input type="hidden" name="place" value={place} />
		<SubmitButton isSaving={tracker.isSaving} class={quietButtonClasses} savingLabel="Searching the job boards…">
			Find open job adverts
		</SubmitButton>
	</form>
	<FormErrorNote message={tracker.errorMessage} />
	{#if adverts !== null && adverts.length === 0}
		<p class="text-xs text-chalk/50">No open adverts found on the job boards.</p>
	{:else if adverts !== null}
		<ul class="flex flex-col gap-2">
			{#each adverts as advert (advert.url)}
				<JobAdvertRow {advert} />
			{/each}
		</ul>
	{/if}
</div>
