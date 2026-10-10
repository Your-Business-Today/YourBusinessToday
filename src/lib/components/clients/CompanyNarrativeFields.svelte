<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import { inputClasses } from '$lib/components/site/formStyles';
	import type { CompanyProfile } from '$lib/server/clients/companyProfile';

	let { profile, openingAnglesRows }: { profile: CompanyProfile; openingAnglesRows: number } = $props();
</script>

<FormField label="Profile">
	<textarea name="summary" rows="4" value={profile.summary} class={inputClasses}></textarea>
</FormField>
<FormField label="Opening angles">
	<textarea name="openingAngles" rows={openingAnglesRows} value={profile.openingAngles} class={inputClasses}
	></textarea>
</FormField>
