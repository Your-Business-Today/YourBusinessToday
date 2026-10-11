<script lang="ts">
	import { inFamilyOrder } from '$lib/data/organisationFamilies';
	import { organisationProjectHint, personalProjectHint, personalProjectLabel } from '$lib/data/personalProject';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';

	let {
		organisations,
		selectedOrganisationId,
		fieldClasses,
		labelClasses
	}: {
		organisations: Organisation[];
		selectedOrganisationId: string | null;
		fieldClasses: string;
		labelClasses: string;
	} = $props();

	const inOrder = $derived(inFamilyOrder(organisations));

	function labelFor(organisation: Organisation): string {
		if (organisation.parentOrganisationId === null) return organisation.name;
		return `  › ${organisation.name}`;
	}
</script>

{#if organisations.length > 0}
	<label class="flex flex-col gap-1">
		<span class={labelClasses}>Organisation</span>
		<select name="organisationId" value={selectedOrganisationId ?? ''} class={fieldClasses}>
			<option value="">{personalProjectLabel}</option>
			{#each inOrder as organisation (organisation.id)}
				<option value={organisation.id}>{labelFor(organisation)}</option>
			{/each}
		</select>
		<span class="text-xs text-chalk/50">{personalProjectHint} {organisationProjectHint}</span>
	</label>
{/if}
