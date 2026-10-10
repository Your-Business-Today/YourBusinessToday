<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import { inputClasses } from '$lib/components/site/formStyles';
	import type { CompanyProfile } from '$lib/server/clients/companyProfile';

	let { profile }: { profile: CompanyProfile } = $props();
</script>

<FormField label="Industry">
	<input name="industry" value={profile.industry} class={inputClasses} />
</FormField>
<FormField label="Location">
	<input name="location" value={profile.location} class={inputClasses} />
</FormField>
