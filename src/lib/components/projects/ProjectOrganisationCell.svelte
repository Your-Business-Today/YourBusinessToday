<script lang="ts">
	import OrganisationBadge from '$lib/components/organisations/OrganisationBadge.svelte';
	import { wideScreenOnlyClasses } from './projectTableStyles';

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

<div class={wideScreenOnlyClasses}>
	<OrganisationBadge {organisationId} {organisationName} {isTeamProject} />
</div>
