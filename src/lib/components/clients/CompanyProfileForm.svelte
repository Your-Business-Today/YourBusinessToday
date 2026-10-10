<script lang="ts">
	import CompanyNarrativeFields from './CompanyNarrativeFields.svelte';
	import CompanyPlaceFields from './CompanyPlaceFields.svelte';
	import CompanyScaleFields from './CompanyScaleFields.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { inputClasses } from '$lib/components/site/formStyles';
	import type { Client } from '$lib/server/clients/clientRecord';

	let { client }: { client: Client } = $props();

	const profile = $derived(client.profile);
</script>

<form method="POST" action="?/updateProfile" class="flex flex-col gap-4">
	<input type="hidden" name="sourceUrl" value={profile.sourceUrl} />
	<div class="grid gap-4 sm:grid-cols-2">
		<FormField label="Website">
			<input name="website" value={client.website} placeholder="https://" class={inputClasses} />
		</FormField>
		<CompanyPlaceFields {profile} />
		<FormField label="Postcode">
			<input name="postcode" value={profile.postcode} placeholder="GU1 3AA" class={inputClasses} />
		</FormField>
		<CompanyScaleFields {profile} />
	</div>
	<CompanyNarrativeFields {profile} openingAnglesRows={3} />
	<div class="flex flex-wrap items-center justify-between gap-3">
		{#if profile.sourceUrl === ''}
			<p class="text-xs text-chalk/40">Nothing researched yet.</p>
		{:else}
			<p class="text-xs text-chalk/40">
				Drawn from <a href={profile.sourceUrl} class="hover:text-signal">{profile.sourceUrl}</a>
			</p>
		{/if}
		<SubmitButton>Save profile</SubmitButton>
	</div>
</form>
