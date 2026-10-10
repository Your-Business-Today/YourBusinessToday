<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import { headcountBandLabels, headcountBandOrder } from '$lib/data/headcountBands';
	import { inputClasses, selectClasses } from '$lib/components/site/formStyles';
	import type { CompanyProfile } from '$lib/server/clients/companyProfile';

	let { profile }: { profile: CompanyProfile } = $props();
</script>

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
