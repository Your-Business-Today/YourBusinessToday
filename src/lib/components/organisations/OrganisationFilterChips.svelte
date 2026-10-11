<script lang="ts">
	import { filterChipClasses } from '$lib/components/projects/filterChipClasses';
	import { inFamilyOrder } from '$lib/data/organisationFamilies';
	import {
		everyOrganisationFilter,
		noOrganisationFilter,
		type OrganisationFilter
	} from '$lib/data/organisationFilter';
	import { personalProjectLabel } from '$lib/data/personalProject';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';

	let {
		organisations,
		hasProjectsUnderNone,
		selectedFilter = $bindable()
	}: { organisations: Organisation[]; hasProjectsUnderNone: boolean; selectedFilter: OrganisationFilter } =
		$props();

	type Chip = { filter: OrganisationFilter; label: string };

	const everyChip: Chip = { filter: everyOrganisationFilter, label: 'Every organisation' };
	const noneChip: Chip = { filter: noOrganisationFilter, label: personalProjectLabel };

	const chips = $derived<Chip[]>([
		everyChip,
		...inFamilyOrder(organisations).map(chipFor),
		...(hasProjectsUnderNone ? [noneChip] : [])
	]);

	function chipFor(organisation: Organisation): Chip {
		const prefix = organisation.parentOrganisationId === null ? '' : '› ';
		return { filter: organisation.id, label: `${prefix}${organisation.name}` };
	}
</script>

{#if organisations.length > 0}
	<div class="scrollbar-hidden -mx-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
		{#each chips as chip (chip.filter)}
			<button
				type="button"
				aria-pressed={selectedFilter === chip.filter}
				onclick={() => (selectedFilter = chip.filter)}
				class={`shrink-0 ${filterChipClasses(selectedFilter === chip.filter)}`}
			>
				{chip.label}
			</button>
		{/each}
	</div>
{/if}
