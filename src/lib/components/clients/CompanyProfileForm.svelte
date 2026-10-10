<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { headcountBandLabels, headcountBandOrder } from '$lib/data/headcountBands';
	import { inputClasses, selectClasses } from '$lib/components/site/formStyles';
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
		<FormField label="Industry">
			<input name="industry" value={profile.industry} class={inputClasses} />
		</FormField>
		<FormField label="Location">
			<input name="location" value={profile.location} class={inputClasses} />
		</FormField>
		<FormField label="Postcode">
			<input name="postcode" value={profile.postcode} placeholder="GU1 3AA" class={inputClasses} />
		</FormField>
		<FormField label="Size">
			<select name="headcountBand" value={profile.headcountBand} class={selectClasses}>
				{#each headcountBandOrder as band (band)}
					<option value={band}>{headcountBandLabels[band]}</option>
				{/each}
			</select>
		</FormField>
		<FormField label="Company number">
			<input name="companyNumber" value={profile.companyNumber} class={inputClasses} />
		</FormField>
	</div>
	<FormField label="Profile">
		<textarea name="summary" rows="4" value={profile.summary} class={inputClasses}></textarea>
	</FormField>
	<FormField label="Opening angles">
		<textarea name="openingAngles" rows="3" value={profile.openingAngles} class={inputClasses}
		></textarea>
	</FormField>
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
