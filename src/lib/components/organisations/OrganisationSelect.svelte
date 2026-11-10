<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import { organisationProjectHint, personalProjectHint, personalProjectLabel } from '$lib/data/personalProject';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let {
		organisations,
		selectedOrganisationId
	}: {
		organisations: Organisation[];
		selectedOrganisationId: string | null;
	} = $props();
</script>

{#if organisations.length > 0}
	<SmallCapsField label="Organisation">
		<select name="organisationId" value={selectedOrganisationId ?? ''} class={fieldClasses}>
			<option value="">{personalProjectLabel}</option>
			{#each organisations as organisation (organisation.id)}
				<option value={organisation.id}>{organisation.name}</option>
			{/each}
		</select>
		<span class="text-xs text-chalk/50">{personalProjectHint} {organisationProjectHint}</span>
	</SmallCapsField>
{/if}
