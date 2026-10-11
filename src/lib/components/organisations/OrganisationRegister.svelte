<script lang="ts">
	import OrganisationRow from './OrganisationRow.svelte';
	import { inFamilyOrder } from '$lib/data/organisationFamilies';
	import type { OrganisationSummary } from '$lib/server/organisations/getOrganisationsWithCounts';

	let { organisations }: { organisations: OrganisationSummary[] } = $props();

	const inOrder = $derived(inFamilyOrder(organisations));
</script>

<ul class="divide-y divide-hairline rounded-2xl border border-hairline bg-carriage">
	{#each inOrder as organisation (organisation.id)}
		<OrganisationRow {organisation} isChild={organisation.parentOrganisationId !== null} />
	{/each}
</ul>
