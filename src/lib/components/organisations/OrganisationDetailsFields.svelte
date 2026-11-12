<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import OrganisationDetailInput from './OrganisationDetailInput.svelte';
	import { longestOrganisationName, type OrganisationDetails } from '$lib/data/organisationRules';
	import type { DetailGroup } from '$lib/data/organisationDetailGroups';

	let {
		details,
		groups,
		namePlaceholder
	}: { details: OrganisationDetails; groups: readonly DetailGroup[]; namePlaceholder: string } = $props();
</script>

<FormField label="Name">
	<input name="name" required value={details.name} placeholder={namePlaceholder} maxlength={longestOrganisationName} />
</FormField>
{#each groups as group (group.key)}
	<fieldset class="min-w-0">
		<legend class="mb-4 font-display text-lg font-semibold text-chalk">{group.title}</legend>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each group.fields as field (field.key)}
				<OrganisationDetailInput {field} value={details[field.key]} />
			{/each}
		</div>
	</fieldset>
{/each}
