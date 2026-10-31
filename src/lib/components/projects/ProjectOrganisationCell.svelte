<script lang="ts">
	import OrganisationBadge from '$lib/components/organisations/OrganisationBadge.svelte';
	import { organisationCellClasses } from './projectTableStyles';

	let {
		organisationId,
		organisationName,
		isTeamProject
	}: {
		organisationId: string | null;
		organisationName: string;
		isTeamProject: boolean;
	} = $props();
</script>

<div class={organisationCellClasses}>
	<OrganisationBadge {organisationId} {organisationName} {isTeamProject} />
</div>
