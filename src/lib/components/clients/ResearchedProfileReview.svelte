<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import ResearchedPeopleFields from './ResearchedPeopleFields.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { headcountBandLabels, headcountBandOrder } from '$lib/data/headcountBands';
	import { inputClasses, panelClasses, selectClasses } from '$lib/components/site/formStyles';
	import type { ResearchedProfile } from '$lib/server/clients/researchedProfile';

	let {
		researched,
		clientId
	}: { researched: ResearchedProfile; clientId: string | null } = $props();

	const profile = $derived(researched.profile);
	const saveLabel = $derived(clientId === null ? 'Save as lead' : 'Update this client');
</script>

<form method="POST" action="?/saveLead" class={panelClasses}>
	<input type="hidden" name="clientId" value={clientId ?? ''} />
	<input type="hidden" name="sourceUrl" value={profile.sourceUrl} />
	<div class="flex flex-wrap items-baseline justify-between gap-3">
		<h2 class="font-display text-lg">What the site says</h2>
		<p class="text-xs text-chalk/40">
			Read from <a href={profile.sourceUrl} class="hover:text-signal">{profile.sourceUrl}</a>
		</p>
	</div>
	<div class="grid gap-4 sm:grid-cols-2">
		<FormField label="Company name">
			<input name="name" value={researched.name} required class={inputClasses} />
		</FormField>
		<FormField label="Website">
			<input name="website" value={researched.website} class={inputClasses} />
		</FormField>
		<FormField label="Industry">
			<input name="industry" value={profile.industry} class={inputClasses} />
		</FormField>
		<FormField label="Location">
			<input name="location" value={profile.location} class={inputClasses} />
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
		<textarea name="openingAngles" rows="4" value={profile.openingAngles} class={inputClasses}
		></textarea>
	</FormField>
	<ResearchedPeopleFields people={researched.people} />
	<div class="flex justify-end">
		<SubmitButton>{saveLabel}</SubmitButton>
	</div>
</form>
