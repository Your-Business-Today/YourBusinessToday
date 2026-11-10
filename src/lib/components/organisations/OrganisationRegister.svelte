<script lang="ts">
	import OrganisationRow from './OrganisationRow.svelte';
	import type { OrganisationSummary } from '$lib/server/organisations/getOrganisationsWithCounts';

	let { organisations }: { organisations: OrganisationSummary[] } = $props();
</script>

<ul class="divide-y divide-hairline rounded-2xl border border-hairline bg-carriage">
	{#each organisations as organisation (organisation.id)}
		<OrganisationRow {organisation} />
	{/each}
</ul>
